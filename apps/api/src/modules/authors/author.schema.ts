import { z } from "zod";

export const CreateAuthorSchema = z.object({
  name: z.string().trim().min(2).max(120),
  bio: z.string().trim().max(1000).nullable().optional(),
  instagramUrl: z.string().trim().max(500).url().refine((value) => {
    let url: URL;
    try { url = new URL(value); } catch { return false; }
    return url.protocol === "https:" && ["instagram.com", "www.instagram.com"].includes(url.hostname) && !url.username && !url.password;
  }, "Use an https://www.instagram.com/ profile URL").nullable().optional(),
  avatarUrl: z.string().trim().max(500).nullable().optional(),
});

export const UpdateAuthorSchema = CreateAuthorSchema;

export type CreateAuthorInput = z.infer<typeof CreateAuthorSchema>;
export type UpdateAuthorInput = z.infer<typeof UpdateAuthorSchema>;
