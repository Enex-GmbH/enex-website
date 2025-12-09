import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
  password: z
    .string()
    .min(8, "Das Passwort muss mindestens 8 Zeichen lang sein"),
  name: z.string().min(2, "Der Name muss mindestens 2 Zeichen lang sein"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
  password: z.string().min(1, "Bitte geben Sie Ihr Passwort ein"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token ist erforderlich"),
  password: z
    .string()
    .min(8, "Das Passwort muss mindestens 8 Zeichen lang sein"),
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Der Name muss mindestens 2 Zeichen lang sein").optional(),
  email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein").optional(),
  phone: z
    .string()
    .optional()
    .transform((val) => (val === "" || !val ? null : val))
    .nullable(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Bitte geben Sie Ihr aktuelles Passwort ein"),
  newPassword: z
    .string()
    .min(8, "Das Passwort muss mindestens 8 Zeichen lang sein"),
  confirmPassword: z.string().min(1, "Bitte bestätigen Sie Ihr neues Passwort"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Die Passwörter stimmen nicht überein",
  path: ["confirmPassword"],
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
