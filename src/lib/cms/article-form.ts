import type { ArticleInput } from "./markdown";

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/svg+xml": "svg",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

export interface ParsedArticleForm {
  input: Omit<ArticleInput, "image"> & { image?: string };
  imageFile?: { buffer: Buffer; ext: string };
  error?: string;
}

export async function parseArticleForm(
  form: FormData,
  existingImage?: string,
): Promise<ParsedArticleForm> {
  const input: ParsedArticleForm["input"] = {
    title: String(form.get("title") ?? "").trim(),
    dek: String(form.get("dek") ?? "").trim(),
    section: String(form.get("section") ?? "latest") as ArticleInput["section"],
    author: String(form.get("author") ?? "").trim(),
    pubDate: String(form.get("pubDate") ?? "").trim(),
    tldr: String(form.get("tldr") ?? ""),
    imageAlt: String(form.get("imageAlt") ?? "").trim(),
    imageCaption: String(form.get("imageCaption") ?? "").trim(),
    featured: form.get("featured") === "on",
    draft: form.get("draft") === "on",
    body: String(form.get("body") ?? "").trim(),
    image: existingImage,
  };

  if (!input.title || !input.dek || !input.body || !input.author) {
    return { input, error: "Headline, dek, byline, and body are all required." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.pubDate)) {
    return { input, error: "Publish date must be a valid date." };
  }
  if (!["latest", "deep-dives", "the-hard-part"].includes(input.section)) {
    return { input, error: "Unknown section." };
  }

  const file = form.get("image");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_IMAGE_BYTES) {
      return { input, error: "Feature image is over 3 MB." };
    }
    const ext = IMAGE_EXTENSIONS[file.type];
    if (!ext) {
      return { input, error: "Feature image must be SVG, PNG, JPG, or WebP." };
    }
    return {
      input,
      imageFile: { buffer: Buffer.from(await file.arrayBuffer()), ext },
    };
  }
  return { input };
}
