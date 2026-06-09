import { z } from "zod";

export const resourceSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(2),
  type: z.enum(["room", "car"]),
  photoUrl: z.string().url().optional().or(z.literal("")),
  isAvailable: z.boolean(),
  location: z.string().optional(),
  capacity: z.coerce.number().int().min(1).optional(),
  equipment: z.array(z.string()).optional(),
  licensePlate: z.string().optional(),
  fuelType: z.enum(["gasoline", "diesel", "electric", "hybrid"]).optional(),
});
export type ResourceValues = z.infer<typeof resourceSchema>;