import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { SITE } from "../config";
import { postHref, sortByDate } from "../lib/utils";

export async function GET(context: APIContext) {
  const posts = sortByDate(await getCollection("posts", ({ data }) => !data.draft));

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: postHref(post),
      categories: [post.data.kind, ...post.data.domains, ...post.data.tags],
      author: SITE.author,
    })),
    customData: `<language>ru-ru</language>`,
  });
}
