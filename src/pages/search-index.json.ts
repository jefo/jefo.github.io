import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { postHref, readingTime, sortByDate } from "../lib/utils";
import { TYPE_META } from "../config";

export const GET: APIRoute = async () => {
  const posts = sortByDate(await getCollection("posts", ({ data }) => !data.draft));

  const index = posts.map((post) => ({
    title: post.data.title,
    description: post.data.description,
    url: postHref(post),
    type: TYPE_META[post.data.type].label,
    tags: post.data.tags,
    date: post.data.date.toISOString(),
    minutes: post.data.time ?? `${readingTime(post.body)} мин`,
    body: (post.body ?? "")
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/[#>*_`\-|]/g, " ")
      .replace(/\s+/g, " ")
      .slice(0, 2400),
  }));

  return new Response(JSON.stringify(index), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
};
