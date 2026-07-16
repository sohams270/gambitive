export interface ArticleInput {
  title: string;
  dek: string;
  section: "latest" | "deep-dives" | "the-hard-part";
  author: string;
  pubDate: string; // YYYY-MM-DD
  tldr?: string;
  authorBio?: string;
  image?: string;
  imageAlt?: string;
  imageCaption?: string;
  featured: boolean;
  draft: boolean;
  body: string;
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/['".,:;!?()₹$%&]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** YAML-safe scalar (JSON string escaping is valid YAML). */
const yamlString = (value: string) => JSON.stringify(value);

export function toMarkdown(input: ArticleInput): string {
  const lines = [
    "---",
    `title: ${yamlString(input.title)}`,
    `dek: ${yamlString(input.dek)}`,
    `section: ${input.section}`,
    `author: ${yamlString(input.author)}`,
    `pubDate: ${input.pubDate}`,
  ];
  if (input.tldr?.trim()) {
    lines.push("tldr: |");
    for (const raw of input.tldr.split("\n")) {
      const point = raw.replace(/^-\s*/, "").trim();
      if (point) lines.push(`  - ${point}`);
    }
  }
  if (input.authorBio?.trim()) lines.push(`authorBio: ${yamlString(input.authorBio.trim())}`);
  if (input.image) lines.push(`image: ${yamlString(input.image)}`);
  if (input.imageAlt?.trim()) lines.push(`imageAlt: ${yamlString(input.imageAlt.trim())}`);
  if (input.imageCaption?.trim()) lines.push(`imageCaption: ${yamlString(input.imageCaption.trim())}`);
  if (input.featured) lines.push("featured: true");
  if (input.draft) lines.push("draft: true");
  lines.push("---", "", input.body.replace(/\r\n/g, "\n").trim(), "");
  return lines.join("\n");
}
