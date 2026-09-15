import { z } from "zod";

export const CreateTagSchema = z.object({
  name: z.string().trim().min(2).max(100),
});

export const UpdateTagSchema = CreateTagSchema;

export type CreateTagInput = z.infer<typeof CreateTagSchema>;
export type UpdateTagInput = z.infer<typeof UpdateTagSchema>;
