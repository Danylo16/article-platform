import { z } from "zod";

export const ArticleDto = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable(),
});

export type ArticleDto = z.infer<typeof ArticleDto>;