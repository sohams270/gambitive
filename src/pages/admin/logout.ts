import type { APIRoute } from "astro";
import { sessionCookie } from "../../lib/cms/auth";

export const prerender = false;

export const POST: APIRoute = ({ cookies, redirect }) => {
  cookies.delete(sessionCookie.name, { path: "/" });
  return redirect("/admin/login/");
};
