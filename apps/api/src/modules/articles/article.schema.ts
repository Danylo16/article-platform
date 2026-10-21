import { z } from "zod";

const CoverFields = {
  coverAlt: z.string().trim().max(300).nullable().optional(),
  coverCaption: z.string().trim().max(500).nullable().optional(),
  coverCredit: z.string().trim().max(200).nullable().optional(),
  coverFocusX: z.number().min(0).max(100).optional(),
  coverFocusY: z.number().min(0).max(100).optional(),
};

export const CreateArticleSchema = z.object({
  ...CoverFields,
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

  sectionId: z
    .string()
    .uuid(),

  categoryId: z
    .string()
    .uuid()
    .optional(),

  placeId: z
    .string()
    .uuid()
    .optional(),

  tagIds: z
    .array(z.string().uuid())
    .default([]),
});

export const UpdateArticleSchema = z.object({
  ...CoverFields,
  title: z.string().trim().min(3).max(200).optional(),
  subtitle: z.string().trim().max(300).nullable().optional(),
  excerpt: z.string().trim().max(500).nullable().optional(),
  content: z.string().min(1).optional(),
  authorId: z.string().uuid().optional(),
  sectionId: z.string().uuid().optional(),
  coverImage: z.string().min(1).nullable().optional(),

  categoryId: z
    .string()
    .uuid()
    .nullable()
    .optional(),
  placeId: z
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
