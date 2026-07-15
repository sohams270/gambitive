import { getCollection } from "astro:content";
import { OGImageRoute } from "astro-og-canvas";
import { SITE, SECTIONS } from "../../lib/site";

// Auto-generated, in-brand share card for every article: headline,
// section label, Gambitive wordmark. This is the storefront on social.
const articles = await getCollection("articles", ({ data }) => !data.draft);

const pages = Object.fromEntries(
  articles.map(({ id, data }) => [
    id,
    { title: data.title, section: SECTIONS[data.section].name },
  ]),
);

pages["default"] = { title: SITE.description, section: "" };

export const { getStaticPaths, GET } = await OGImageRoute({
  param: "route",
  pages,
  getImageOptions: (_path, page: { title: string; section: string }) => ({
    title: page.title,
    description: page.section
      ? `${page.section}  ·  Gambitive`
      : "Gambitive",
    // Brand forest green, flat — no gradient tricks.
    bgGradient: [[14, 87, 65]],
    padding: 72,
    font: {
      title: {
        // CanvasKit registers these TTFs with the weight in the family name.
        // Noto Sans is the per-glyph fallback: Fraunces has no ₹ (U+20B9),
        // and rupee figures appear in headlines constantly.
        families: ["Fraunces SemiBold", "Noto Sans SemiBold"],
        weight: "SemiBold",
        size: 64,
        lineHeight: 1.15,
        color: [253, 253, 251],
      },
      description: {
        families: ["Inter Medium", "Noto Sans SemiBold"],
        weight: "Medium",
        size: 28,
        color: [204, 221, 214],
      },
    },
    fonts: [
      "https://api.fontsource.org/v1/fonts/fraunces/latin-600-normal.ttf",
      "https://api.fontsource.org/v1/fonts/inter/latin-500-normal.ttf",
      "https://api.fontsource.org/v1/fonts/noto-sans/latin-ext-600-normal.ttf",
      "https://api.fontsource.org/v1/fonts/noto-sans/devanagari-600-normal.ttf",
    ],
  }),
});
