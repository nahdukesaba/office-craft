import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Min 6 characters"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  fullName: z.string().min(2, "Required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Min 6 characters"),
  phone: z
    .string()
    .trim()
    .regex(/^\d{8,15}$/, "Digits only, e.g. 6281234567890")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});
export type RegisterValues = z.infer<typeof registerSchema>;