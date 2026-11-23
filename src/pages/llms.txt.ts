import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { KIND_META, SITE } from "../config";
import { DOMAINS, GLOSSARY, ROUTES, glossarySlug } from "../data/hub";
import {
  conceptCode,
  formatDate,
  postDomains,
  postHref,
  sortedConcepts,
} from "../lib/utils";

export const GET: APIRoute = async () => {
  const posts = sortedConcepts(await getCollection("posts", ({ data }) => !data.draft));
  const updated = posts.reduce((date, post) => {
    const candidate = post.data.updated ?? post.data.date;
    return candidate > date ? candidate : date;
  }, new Date(0));

  const lines: string[] = [
    "# native/ — картотека знаний",
    "",
    `> ${SITE.description}`,
    "",
    `Миссия: ${SITE.mission}. Язык: ru. Обновлено: ${formatDate(updated)}.`,
    "Главный вход — каталог, маршруты и атлас, а не хронологическая лента.",
    "",
    "## Направления",
    "",
    ...DOMAINS.map(
      (domain) => `- [${domain.name}](${SITE.url}/domains/${domain.id}) — ${domain.tagline}. ${domain.description}`,
    ),
    "",
    "## Концепты",
    "",
    ...posts.map((post) => {
      const domains = postDomains(post).map((domain) => domain.name).join(", ");
      return `- [${conceptCode(post)} — ${post.data.short ?? post.data.title}](${SITE.url}${postHref(post)}) — ${KIND_META[post.data.kind].label}; ${domains}. ${post.data.description}`;
    }),
    "",
    "## Маршруты",
    "",
    ...ROUTES.map((route) => {
      const stops = route.steps
        .map((step) => posts.find((post) => post.data.uid === step.conceptId))
        .filter((post) => Boolean(post))
        .map((post) => `${conceptCode(post!)} ${post!.data.short ?? post!.data.title}`)
        .join(" → ");
      return `- [${route.code} — ${route.title}](${SITE.url}/paths/${route.slug}) — ${route.goal} ${route.subtitle}. ${stops}`;
    }),
    "",
    "## Атлас и словарь",
    "",
    `- [Атлас связей](${SITE.url}/atlas) — интерактивная карта концептов по общим темам.`,
    `- [Словарь](${SITE.url}/glossary) — термины со ссылками на концепты.`,
    "",
    "### Термины",
    "",
    ...GLOSSARY.map(
      (term) =>
        `- [${term.term}](${SITE.url}/glossary#${glossarySlug(term.term)}) — ${term.definition}`,
    ),
    "",
    "## Служебное",
    "",
    `- [Каталог](${SITE.url}/)`,
    `- [Старт](${SITE.url}/start)`,
    `- [О картотеке](${SITE.url}/about)`,
    `- [Поиск](${SITE.url}/search)`,
    `- [RSS](${SITE.url}/rss.xml)`,
    "",
    "## Карта URL",
    "",
    "- `/recipes/*` — рецепты",
    "- `/guides/*` — гайды",
    "- `/notes/*` — заметки",
    "- `/tags/*` — тематические срезы",
    "- `/domains/*` — направления",
    "- `/paths/*` — маршруты",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
};
