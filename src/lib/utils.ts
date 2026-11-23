import type { CollectionEntry } from "astro:content";
import { DOMAINS, DOMAIN_BY_ID, ROUTES, type Domain, type DomainId } from "../data/hub";

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
  return `/concepts/${post.id.replace(/\.(md|mdx)$/, "")}`;
}

export function postMinutes(post: Post): string {
  return post.data.time ?? `${readingTime(post.body)} мин`;
}

export function parseMinutes(value: string): number {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

export function sortByDate(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function conceptCode(post: Post): string {
  return post.data.uid;
}

export function conceptSort(a: Post, b: Post): number {
  return conceptCode(a).localeCompare(conceptCode(b), "ru", { numeric: true });
}

export function sortedConcepts(posts: Post[]): Post[] {
  return [...posts].sort(conceptSort);
}

export function primaryDomain(post: Post): Domain {
  const id = post.data.domains[0] as DomainId;
  return DOMAIN_BY_ID[id] ?? DOMAINS[0];
}

export function postDomains(post: Post): Domain[] {
  return post.data.domains.map((id) => DOMAIN_BY_ID[id as DomainId]).filter(Boolean);
}

export function postsInDomain(posts: Post[], domain: DomainId): Post[] {
  return sortedConcepts(posts.filter((post) => post.data.domains.includes(domain)));
}

/** Сколько концептов в каждом направлении, с учётом пересечений. */
export function domainCounts(posts: Post[]): Record<DomainId, number> {
  const counts = Object.fromEntries(DOMAINS.map((d) => [d.id, 0])) as Record<DomainId, number>;
  for (const post of posts) {
    for (const id of post.data.domains) counts[id as DomainId] += 1;
  }
  return counts;
}

/** Пересечения направлений: сколько общих концептов. */
export function domainOverlaps(posts: Post[], domain: DomainId) {
  const own = new Set(postsInDomain(posts, domain).map((p) => p.id));
  return DOMAINS.filter((d) => d.id !== domain)
    .map((other) => {
      const shared = posts.filter(
        (p) => p.data.domains.includes(other.id) && own.has(p.id),
      );
      return { domain: other, posts: shared };
    })
    .filter((entry) => entry.posts.length > 0)
    .sort((a, b) => b.posts.length - a.posts.length);
}

/** Пары концептов, у которых есть общие теги. Основа атласа и счётчика связей. */
export function tagConnections(posts: Post[]) {
  const pairs: { a: Post; b: Post; weight: number; sharedTags: string[] }[] = [];
  for (let i = 0; i < posts.length; i++) {
    for (let j = i + 1; j < posts.length; j++) {
      const a = posts[i];
      const b = posts[j];
      const sharedTags = a.data.tags.filter((tag) => b.data.tags.includes(tag));
      if (sharedTags.length > 0) pairs.push({ a, b, weight: sharedTags.length, sharedTags });
    }
  }
  return pairs;
}

/** Связи для статьи: общие теги весят больше, общее направление — меньше. */
export function connections(post: Post, all: Post[], limit = 4) {
  const scored = all
    .filter((p) => p.id !== post.id)
    .map((p) => {
      const sharedTags = p.data.tags.filter((tag) => post.data.tags.includes(tag));
      const sharedDomains = p.data.domains.filter((d) => post.data.domains.includes(d));
      const score = sharedTags.length * 2 + sharedDomains.length;
      return { post: p, score, sharedTags, sharedDomains };
    })
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.post.data.date.valueOf() - a.post.data.date.valueOf(),
    );
  return scored.slice(0, limit);
}

/** Пара «до/после» для статьи: соседи по картотеке, если нет маршрута. */
export function conceptNeighbours(post: Post, all: Post[]) {
  const ordered = sortedConcepts(all);
  const index = ordered.findIndex((p) => p.id === post.id);
  return {
    previous: index > 0 ? ordered[index - 1] : undefined,
    next: index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : undefined,
  };
}

export function routesForPost(postUid: string) {
  return ROUTES.filter((route) => route.steps.some((step) => step.conceptId === postUid));
}

export function routeDuration(routeId: string, all: Post[]): number {
  const route = ROUTES.find((r) => r.slug === routeId);
  if (!route) return 0;
  return route.steps.reduce((sum, step) => {
    const post = all.find((p) => p.data.uid === step.conceptId);
    return sum + (post ? parseMinutes(postMinutes(post)) : 0);
  }, 0);
}

export function routePosts(routeId: string, all: Post[]) {
  const route = ROUTES.find((r) => r.slug === routeId);
  if (!route) return [];
  return route.steps
    .map((step) => {
      const post = all.find((p) => p.data.uid === step.conceptId);
      return post ? { post, note: step.note } : undefined;
    })
    .filter((entry): entry is { post: Post; note: string } => Boolean(entry));
}

/** Все теги, отсортированные по частоте. */
export function allTags(posts: Post[]): { tag: string; count: number }[] {
  const map = new Map<string, number>();
  for (const post of posts) for (const tag of post.data.tags) map.set(tag, (map.get(tag) ?? 0) + 1);
  return [...map.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** Детерминированный цвет для тега — из палитры направлений и синтаксиса. */
const TAG_COLORS = [
  "var(--dom-context)",
  "var(--dom-agents)",
  "var(--dom-tools)",
  "var(--dom-practice)",
  "var(--tok-key)",
  "var(--tok-fn)",
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

/** «K-01 · Контекст» — короткая подпись для метаданных. */
export function conceptLabel(post: Post): string {
  return `${conceptCode(post)} · ${primaryDomain(post).name}`;
}
