import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE, SECTIONS } from "../lib/site";

export async function GET(context) {
  const articles = (
    await getCollection("articles", ({ data }) => !data.draft)
  ).sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site,
    items: articles.map((article) => ({
      title: article.data.title,
      description: article.data.dek,
      pubDate: article.data.pubDate,
      link: `/${SECTIONS[article.data.section].slug}/${article.id}/`,
      categories: [SECTIONS[article.data.section].name],
      author: article.data.author,
    })),
  });
}
