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

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(6, "Min 6 characters"),
    newPassword: z.string().min(6, "Min 6 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export const updatePhoneSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\d{8,15}$/, "Digits only, e.g. 6281234567890"),
});
export type UpdatePhoneValues = z.infer<typeof updatePhoneSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Min 8 characters").max(128, "Max 128 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
