import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { rehypeInlineSignup } from "./src/lib/rehype-inline-signup.ts";

export default defineConfig({
  site: "https://gambitive.com",
  integrations: [sitemap()],
  markdown: {
    rehypePlugins: [rehypeInlineSignup],
  },
});
