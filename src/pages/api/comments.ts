import type { APIRoute } from "astro";
import { randomBytes } from "node:crypto";
import { readFile, saveFiles } from "../../lib/cms/store";

export const prerender = false;

interface StoredComment {
  id: string;
  name: string;
  email: string; // collected, never rendered publicly
  text: string;
  date: string;
  parentId?: string;
}

const LIMITS = { name: 60, email: 120, text: 4000 };

async function parseBody(request: Request): Promise<Record<string, string>> {
  const type = request.headers.get("content-type") ?? "";
  if (type.includes("application/json")) {
    return await request.json();
  }
  const form = await request.formData();
  return Object.fromEntries(
    [...form.entries()].map(([k, v]) => [k, String(v)]),
  ) as Record<string, string>;
}

export const POST: APIRoute = async ({ request }) => {
  const wantsJson = (request.headers.get("accept") ?? "").includes("application/json");

  const respond = (status: number, message: string, redirectTo?: string) => {
    if (wantsJson || !redirectTo) {
      return new Response(JSON.stringify({ ok: status < 400, message }), {
        status,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(null, { status: 303, headers: { Location: redirectTo } });
  };

  try {
    const body = await parseBody(request);

    // Honeypot: humans never see this field
    if (body.website) return respond(200, "Thanks!");

    const slug = String(body.slug ?? "").trim();
    const section = String(body.section ?? "").trim();
    const name = String(body.name ?? "").trim().slice(0, LIMITS.name);
    const email = String(body.email ?? "").trim().slice(0, LIMITS.email);
    const text = String(body.text ?? "").trim().slice(0, LIMITS.text);
    const parentId = String(body.parentId ?? "").trim();

    if (!/^[a-z0-9-]{3,100}$/.test(slug) || !/^[a-z-]{3,20}$/.test(section)) {
      return respond(400, "Invalid request.");
    }
    if (!name || !text || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return respond(400, "Name, a valid email, and a comment are required.");
    }

    // The article must actually exist
    const article = await readFile(`src/content/articles/${slug}.md`);
    if (!article) return respond(404, "Article not found.");

    const commentsPath = `src/data/comments/${slug}.json`;
    const existing = await readFile(commentsPath);
    const comments: StoredComment[] = existing ? JSON.parse(existing) : [];

    // One-level threading: replying to a reply attaches to its parent
    let parent: string | undefined;
    if (parentId) {
      const target = comments.find((c) => c.id === parentId);
      if (target) parent = target.parentId ?? target.id;
    }

    comments.push({
      id: `c_${Date.now()}_${randomBytes(3).toString("hex")}`,
      name,
      email,
      text,
      date: new Date().toISOString(),
      ...(parent ? { parentId: parent } : {}),
    });

    await saveFiles(
      [{ repoPath: commentsPath, content: JSON.stringify(comments, null, 2) + "\n" }],
      `Comment on ${slug} by ${name}`,
    );

    const articleUrl = `/${section}/${slug}/`;
    return respond(
      200,
      "Thanks — your comment is in. It appears on the site in a minute or two.",
      `${articleUrl}?commented=1#comments`,
    );
  } catch (e) {
    return respond(500, e instanceof Error ? e.message : "Something went wrong.");
  }
};
