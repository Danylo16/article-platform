import { z } from "zod";

const PlaceFieldsSchema = z.object({
  name: z.string().trim().min(2).max(160),
  typeId: z.string().trim().min(1),
  address: z.string().trim().min(3).max(240),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  isVisible: z.boolean(),
});

export const CreatePlaceSchema = PlaceFieldsSchema;
export const UpdatePlaceSchema = PlaceFieldsSchema.partial().refine(
  (input) => Object.keys(input).length > 0,
  "At least one field is required",
);

export type CreatePlaceInput = z.infer<typeof CreatePlaceSchema>;
export type UpdatePlaceInput = z.infer<typeof UpdatePlaceSchema>;
