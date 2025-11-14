import { z } from "zod"

export const CreateChatRoomSchema = z.object({
  name: z
    .string({ message: "REQUIRED" })
    .min(3, { message: "TOO_SHORT" })
    .max(80, { message: "TOO_LONG" })
    .trim(),
  description: z
    .string({ message: "REQUIRED" })
    .min(5, { message: "TOO_SHORT" })
    .max(160, { message: "TOO_LONG" })
    .trim(),
  theme: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value),
      { message: "INVALID" },
    ),
})

