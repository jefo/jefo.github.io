import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { TYPE_META } from "../config";
import {
  conceptCode,
  postDomains,
  postHref,
  postMinutes,
  sortByDate,
} from "../lib/utils";

export const GET: APIRoute = async () => {
  const posts = sortByDate(await getCollection("posts", ({ data }) => !data.draft));

  const index = posts.map((post) => ({
    title: post.data.title,
    description: post.data.description,
    short: post.data.short ?? post.data.title,
    url: postHref(post),
    type: TYPE_META[post.data.type].label,
    code: conceptCode(post),
    domains: postDomains(post).map((domain) => ({
      id: domain.id,
      name: domain.name,
      color: domain.color,
    })),
    tags: post.data.tags,
    date: post.data.date.toISOString(),
    minutes: postMinutes(post),
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
