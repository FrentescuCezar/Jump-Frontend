import { z } from "zod"

/* ------------------------------------------------------------------ */
/* Password Requirements (shared between schema and UI)              */
/* ------------------------------------------------------------------ */

export interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

/**
 * Password requirements configuration.
 * Used by both Zod schema validation and PasswordStrength component.
 */
export const passwordRequirements: PasswordRequirement[] = [
  {
    label: "passwordRequirements.minLength",
    test: (pwd: string) => pwd.length >= 8,
  },
  {
    label: "passwordRequirements.uppercase",
    test: (pwd: string) => /[A-Z]/.test(pwd),
  },
  {
    label: "passwordRequirements.number",
    test: (pwd: string) => /[0-9]/.test(pwd),
  },
  {
    label: "passwordRequirements.specialChar",
    test: (pwd: string) => /[!@#$%^&*]/.test(pwd),
  },
]

/* ------------------------------------------------------------------ */
/* Signup Schema                                                      */
/* ------------------------------------------------------------------ */

export const SignupSchema = z
  .object({
    firstName: z
      .string({ message: "REQUIRED" })
      .min(1, { message: "REQUIRED" })
      .max(100, { message: "TOO_LONG" })
      .trim(),
    lastName: z.string().max(100, { message: "TOO_LONG" }).trim().optional(),
    email: z
      .string({ message: "REQUIRED" })
      .email({ message: "INVALID" })
      .max(255, { message: "TOO_LONG" })
      .trim(),
    password: z
      .string({ message: "REQUIRED" })
      .min(8, { message: "TOO_SHORT" })
      .max(100, { message: "TOO_LONG" })
      .refine(
        passwordRequirements[1].test, // uppercase
        { message: "invalidPassword" },
      )
      .refine(
        passwordRequirements[2].test, // number
        { message: "invalidPassword" },
      )
      .refine(
        passwordRequirements[3].test, // specialChar
        { message: "invalidPassword" },
      ),
    confirmPassword: z.string({ message: "REQUIRED" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwordMismatch",
    path: ["confirmPassword"],
  })
