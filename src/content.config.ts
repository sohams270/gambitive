import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const articles = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    dek: z.string(), // one-line summary shown on cards and as meta description
    section: z.enum(["latest", "deep-dives", "the-hard-part"]),
    author: z.string().default("Gambitive Staff"),
    // Optional TL;DR shown in the article's left rail. One point per line;
    // leading "- " is stripped.
    tldr: z.string().optional(),
    // Optional author bio for the end-of-article card; falls back to the
    // house bios in the article template.
    authorBio: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = { articles };
