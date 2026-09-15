import { z } from "zod";

export const CreateArticleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must contain at least 3 characters")
    .max(200),

  subtitle: z
    .string()
    .trim()
    .max(300)
    .optional(),

  excerpt: z
    .string()
    .trim()
    .max(500)
    .optional(),

  coverImage: z
    .string()
    .min(1)
    .optional(),

  content: z
    .string()
    .min(1, "Content cannot be empty"),

  authorId: z
    .string()
    .uuid(),

  categoryId: z
    .string()
    .uuid()
    .optional(),

  tagIds: z
    .array(z.string().uuid())
    .default([]),
});

export const UpdateArticleSchema = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  subtitle: z.string().trim().max(300).nullable().optional(),
  excerpt: z.string().trim().max(500).nullable().optional(),
  content: z.string().min(1).optional(),
  coverImage: z
  .string()
  .min(1)
  .nullable()
  .optional(),

  categoryId: z
    .string()
    .uuid()
    .nullable()
    .optional(),
  
    

  tagIds: z
    .array(z.string().uuid())
    .optional(),
});

export type CreateArticleInput = z.infer<
  typeof CreateArticleSchema
>;

export type UpdateArticleInput = z.infer<
  typeof UpdateArticleSchema
>;