import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const posts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    type: z.enum(["recipe", "guide", "note"]),
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
