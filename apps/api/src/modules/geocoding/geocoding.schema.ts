import { z } from "zod";

export const GeocodeAddressSchema = z.object({
  address: z.string().trim().min(3).max(240),
});
