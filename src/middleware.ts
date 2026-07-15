import { defineMiddleware } from "astro:middleware";
import { readSession, sessionCookie } from "./lib/cms/auth";

export const onRequest = defineMiddleware((context, next) => {
  const { pathname } = context.url;

  if (!pathname.startsWith("/admin")) return next();

  const user = readSession(context.cookies.get(sessionCookie.name)?.value);
  context.locals.user = user;

  const isLoginPage = pathname === "/admin/login" || pathname === "/admin/login/";
  if (!user && !isLoginPage) {
    return context.redirect("/admin/login/");
  }
  if (user && isLoginPage) {
    return context.redirect("/admin/");
  }
  return next();
});
