import { z } from "zod"
import { SocialChannelSchema } from "@/schemas/meetings/details"

export const AutomationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  channel: SocialChannelSchema,
  promptTemplate: z.string(),
  isEnabled: z.boolean(),
  config: z.record(z.unknown()).nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const AutomationListSchema = z.array(AutomationSchema)

export type Automation = z.infer<typeof AutomationSchema>
