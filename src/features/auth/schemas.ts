import { z } from "zod";

/**
 * Validation contracts for the auth flow.
 *
 * These schemas are the single source of truth: they drive client-side form
 * validation today, and must be re-parsed server-side by the Server Action or
 * route handler once the PrismSek API is wired up. Client validation is a UX
 * affordance, never a security control — see docs/CODING_STANDARDS.md §8.
 */

/** Minimum password length. Keep in sync with the hint copy in content.ts. */
export const PASSWORD_MIN_LENGTH = 8;

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Enter your work email")
  .email("Enter a valid email address");

export const signInEmailSchema = z.object({
  email: emailSchema,
});
export type SignInEmailValues = z.infer<typeof signInEmailSchema>;

export const passwordSchema = z.object({
  password: z.string().min(1, "Enter your password"),
});
export type PasswordValues = z.infer<typeof passwordSchema>;

const newPasswordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters`);

export const signUpSchema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name"),
  lastName: z.string().trim().min(1, "Enter your last name"),
  email: emailSchema,
  password: newPasswordSchema,
  acceptedTerms: z.literal(true, {
    message: "Accept the Terms of Service and Privacy Policy to continue",
  }),
});
export type SignUpValues = z.infer<typeof signUpSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: newPasswordSchema,
    confirmPassword: z.string().min(1, "Re-enter your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
