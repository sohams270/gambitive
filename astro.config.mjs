import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import { rehypeInlineSignup } from "./src/lib/rehype-inline-signup.ts";

export default defineConfig({
  site: "https://gambitive.com",
  // Public pages stay fully static; only /admin/* opts into on-demand
  // rendering (prerender = false) for auth + publishing.
  adapter: vercel(),
  integrations: [sitemap()],
  markdown: {
    rehypePlugins: [rehypeInlineSignup],
  },
});
