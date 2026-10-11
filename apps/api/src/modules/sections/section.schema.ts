import { z } from "zod";

export const UpdateSectionSchema = z
  .object({
    name: z.string().trim().min(2).max(40).optional(),
    navigationOrder: z.number().int().min(0).max(999).optional(),
    isVisible: z.boolean().optional(),
  })
  .refine((input) => Object.keys(input).length > 0, {
    message: "At least one field is required",
  });
