import { z } from "zod";

export const CreateAuthorSchema = z.object({
  name: z.string().trim().min(2).max(120),
  bio: z.string().trim().max(1000).nullable().optional(),
  avatarUrl: z.string().trim().max(500).nullable().optional(),
});

export const UpdateAuthorSchema = CreateAuthorSchema;

export type CreateAuthorInput = z.infer<typeof CreateAuthorSchema>;
export type UpdateAuthorInput = z.infer<typeof UpdateAuthorSchema>;
