import { z } from "zod";
export const CreateAuthorSchema = z.object({
    name: z.string().trim().min(2).max(120),
    bio: z.string().trim().max(1000).nullable().optional(),
    avatarUrl: z.string().trim().max(500).nullable().optional(),
});
export const UpdateAuthorSchema = CreateAuthorSchema;
//# sourceMappingURL=author.schema.js.map