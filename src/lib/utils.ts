import type { CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"posts">;

const dateFmt = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const shortFmt = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});

export function formatDate(date: Date): string {
  return dateFmt.format(date).replace(" г.", "");
}

export function shortDate(date: Date): string {
  return shortFmt.format(date);
}

export function isoDate(date: Date): string {
  return date.toISOString();
}

/** Приблизительное время чтения: 170 слов/мин + код читают медленнее. */
export function readingTime(body = ""): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  const codeBlocks = (body.match(/```/g)?.length ?? 0) / 2;
  return Math.max(1, Math.round(words / 170 + codeBlocks * 0.35));
}

export function postHref(post: Post): string {
  const plural =
    post.data.type === "recipe" ? "recipes" : post.data.type === "guide" ? "guides" : "notes";
  return `/${plural}/${post.id.replace(/\.(md|mdx)$/, "")}`;
}

export function sortByDate(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function related(post: Post, all: Post[], limit = 2): Post[] {
  const scored = all
    .filter((p) => p.id !== post.id)
    .map((p) => ({
      post: p,
      score: p.data.tags.filter((t) => post.data.tags.includes(t)).length,
      sameType: p.data.type === post.data.type ? 0.5 : 0,
    }))
    .sort(
      (a, b) =>
        b.score + b.sameType - (a.score + a.sameType) ||
        b.post.data.date.valueOf() - a.post.data.date.valueOf(),
    );
  return scored.slice(0, limit).map((s) => s.post);
}

/** Детерминированный цвет для тега — из палитры синтаксиса. */
const TAG_COLORS = [
  "var(--tok-str)",
  "var(--tok-key)",
  "var(--tok-fn)",
  "var(--tok-num)",
  "var(--tok-var)",
];

export function tagColor(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = (hash * 31 + tag.charCodeAt(i)) >>> 0;
  return TAG_COLORS[hash % TAG_COLORS.length];
}

/** Русская форма после числа: 1 материал, 2 материала, 5 материалов. */
export function plural(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}

export function allTags(posts: Post[]): { tag: string; count: number }[] {
  const map = new Map<string, number>();
  for (const post of posts) for (const tag of post.data.tags) map.set(tag, (map.get(tag) ?? 0) + 1);
  return [...map.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function groupByYear(posts: Post[]): { year: number; posts: Post[] }[] {
  const map = new Map<number, Post[]>();
  for (const post of sortByDate(posts)) {
    const year = post.data.date.getFullYear();
    map.set(year, [...(map.get(year) ?? []), post]);
  }
  return [...map.entries()].map(([year, posts]) => ({ year, posts }));
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
