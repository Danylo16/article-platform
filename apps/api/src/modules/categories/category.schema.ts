import { z } from "zod";

export const CreateCategorySchema = z.object({
  name: z.string().trim().min(2).max(100),
});

export const UpdateCategorySchema = CreateCategorySchema;

export type CreateCategoryInput = z.infer<
  typeof CreateCategorySchema
>;

export type UpdateCategoryInput = z.infer<
  typeof UpdateCategorySchema
>;
