import { z } from "zod";

export const LocationIconSchema = z.enum([
  "coffee",
  "restaurant",
  "bar",
  "bakery",
  "music",
  "theatre",
  "cinema",
  "museum",
  "gallery",
  "shopping",
  "market",
  "park",
  "nature",
  "hotel",
  "landmark",
  "church",
  "library",
  "sports",
  "wellness",
  "nightlife",
  "family",
  "viewpoint",
  "coworking",
  "other",
]);

const LocationTypeFieldsSchema = z.object({
  name: z.string().trim().min(2).max(80),
  icon: LocationIconSchema,
  navigationOrder: z.number().int().min(0).max(999),
  isVisible: z.boolean(),
});

export const CreateLocationTypeSchema = LocationTypeFieldsSchema;
export const UpdateLocationTypeSchema = LocationTypeFieldsSchema.partial().refine(
  (input) => Object.keys(input).length > 0,
  "At least one field is required",
);

export type CreateLocationTypeInput = z.infer<
  typeof CreateLocationTypeSchema
>;
export type UpdateLocationTypeInput = z.infer<
  typeof UpdateLocationTypeSchema
>;
