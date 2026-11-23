import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { FORMAT_META, KIND_META } from "../config";
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
    uid: conceptCode(post),
    format: FORMAT_META[post.data.format].label,
    kind: post.data.kind,
    kindLabel: KIND_META[post.data.kind].label,
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
