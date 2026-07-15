import { scryptSync, randomBytes, createHmac, timingSafeEqual } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import usersAtBuild from "../../data/users.json";

export interface CmsUser {
  username: string;
  name: string;
  role: "superadmin" | "author";
  salt: string;
  passwordHash: string;
  bio?: string;
}

const SESSION_COOKIE = "gambitive_session";
const SESSION_HOURS = 8;

function sessionSecret(): string {
  // In production, set SESSION_SECRET in Vercel env. The dev fallback keeps
  // local work friction-free but never guards a public deployment.
  const secret = import.meta.env.SESSION_SECRET ?? process.env.SESSION_SECRET;
  if (secret) return secret;
  if (import.meta.env.PROD) return "";
  return "dev-only-secret";
}

export function isConfigured(): boolean {
  return Boolean(sessionSecret());
}

/** Read users fresh from disk when possible (dev), else the build-time copy. */
export function loadUsers(): CmsUser[] {
  try {
    const p = path.join(process.cwd(), "src/data/users.json");
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch {
    return usersAtBuild as CmsUser[];
  }
}

export function hashPassword(password: string): { salt: string; passwordHash: string } {
  const salt = randomBytes(16).toString("hex");
  const passwordHash = scryptSync(password, salt, 64).toString("hex");
  return { salt, passwordHash };
}

export function verifyPassword(user: CmsUser, password: string): boolean {
  const candidate = scryptSync(password, user.salt, 64);
  const actual = Buffer.from(user.passwordHash, "hex");
  return candidate.length === actual.length && timingSafeEqual(candidate, actual);
}

function sign(payload: string): string {
  return createHmac("sha256", sessionSecret()).update(payload).digest("hex");
}

export function createSessionValue(username: string): string {
  const payload = Buffer.from(
    JSON.stringify({ u: username, exp: Date.now() + SESSION_HOURS * 3600_000 }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readSession(cookieValue: string | undefined): CmsUser | null {
  if (!cookieValue || !sessionSecret()) return null;
  const [payload, sig] = cookieValue.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const { u, exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof exp !== "number" || exp < Date.now()) return null;
    return loadUsers().find((user) => user.username === u) ?? null;
  } catch {
    return null;
  }
}

export const sessionCookie = {
  name: SESSION_COOKIE,
  options: {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: import.meta.env.PROD,
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  },
};
