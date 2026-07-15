import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);

/**
 * Where published files go. Two backends, same repo either way:
 *  - Local (dev / laptop): write to disk, then git commit + push, which
 *    triggers the Vercel deploy.
 *  - Vercel (serverless, read-only fs): commit via the GitHub contents API
 *    using GITHUB_TOKEN, which triggers the deploy.
 */
const onVercel = Boolean(process.env.VERCEL);
const REPO = process.env.GITHUB_REPO ?? "sohams270/gambitive";

function githubToken(): string {
  const token = import.meta.env.GITHUB_TOKEN ?? process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error(
      "GITHUB_TOKEN is not set. Add it in Vercel → Project → Settings → Environment Variables so the CMS can publish.",
    );
  }
  return token;
}

async function githubRequest(
  method: string,
  apiPath: string,
  body?: object,
): Promise<any> {
  const res = await fetch(`https://api.github.com${apiPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${githubToken()}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "gambitive-cms",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`GitHub API ${method} ${apiPath} failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function githubSha(repoPath: string): Promise<string | undefined> {
  const existing = await githubRequest("GET", `/repos/${REPO}/contents/${repoPath}`);
  return existing?.sha;
}

async function localCommitPush(message: string, repoPaths: string[]): Promise<string> {
  const cwd = process.cwd();
  // Stage only what the CMS touched — never sweep up unrelated local edits.
  await exec("git", ["add", "--", ...repoPaths], { cwd });
  await exec("git", ["commit", "-m", `${message}\n\nPublished via Gambitive CMS`], { cwd });
  try {
    await exec("git", ["push"], { cwd });
    return "Saved, committed, and pushed — deploy is on its way.";
  } catch {
    return "Saved and committed locally, but the push failed (offline?). Run `git push` to deploy.";
  }
}

export interface FileToSave {
  repoPath: string;
  content: string | Buffer;
}

/** Create or update repo files (one commit locally, one API call each on Vercel). */
export async function saveFiles(files: FileToSave[], message: string): Promise<string> {
  if (onVercel) {
    for (const file of files) {
      const body: Record<string, unknown> = {
        message: `${message}\n\nPublished via Gambitive CMS`,
        content: Buffer.from(file.content).toString("base64"),
      };
      const sha = await githubSha(file.repoPath);
      if (sha) body.sha = sha;
      await githubRequest("PUT", `/repos/${REPO}/contents/${file.repoPath}`, body);
    }
    return "Committed to GitHub — Vercel is deploying it now (~1 minute).";
  }
  for (const file of files) {
    const abs = path.join(process.cwd(), file.repoPath);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, file.content);
  }
  return localCommitPush(message, files.map((f) => f.repoPath));
}

export async function deleteFile(repoPath: string, message: string): Promise<string> {
  if (onVercel) {
    const sha = await githubSha(repoPath);
    if (!sha) throw new Error(`File not found in repo: ${repoPath}`);
    await githubRequest("DELETE", `/repos/${REPO}/contents/${repoPath}`, {
      message: `${message}\n\nPublished via Gambitive CMS`,
      sha,
    });
    return "Deleted and committed — Vercel is deploying the change.";
  }
  const abs = path.join(process.cwd(), repoPath);
  if (fs.existsSync(abs)) fs.unlinkSync(abs);
  return localCommitPush(message, [repoPath]);
}
