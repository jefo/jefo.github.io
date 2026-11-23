import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const posts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    /** Стабильный идентификатор, не зависит от направления и формата. */
    uid: z.string().regex(/^AI-\d{3}$/),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    /** Формат подачи — не тип знания. */
    format: z.enum(["recipe", "guide", "note"]),
    /** Тип знания — facet для фильтрации, карточек и атласа. */
    kind: z.enum(["principle", "pattern", "technique", "workflow", "tool", "architecture"]),
    /** Направления картотеки. Первое — основное, остальные — пересечения. */
    domains: z
      .array(z.enum(["context", "agents", "tools", "practice"]))
      .min(1)
      .default(["practice"]),
    /** Короткая подпись для атласа и компактных карточек. */
    short: z.string().optional(),
    tags: z.array(z.string()).default([]),
    level: z.enum(["easy", "medium", "hard"]).optional(),
    /** Ручная оценка времени, иначе считается автоматически. */
    time: z.string().optional(),
    tools: z.array(z.string()).optional(),
    /** Ссылка на YouTube Shorts, к которому прилагается материал. */
    youtube: z.url().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
