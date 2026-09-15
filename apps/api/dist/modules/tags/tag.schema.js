import { z } from "zod";
export const CreateTagSchema = z.object({
    name: z.string().trim().min(2).max(100),
});
export const UpdateTagSchema = CreateTagSchema;
//# sourceMappingURL=tag.schema.js.map