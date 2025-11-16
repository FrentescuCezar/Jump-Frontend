import { z } from "zod"
import {
  CalendarEventApiSchema,
  MeetingPlatformSchema,
  RecallBotStatusSchema,
} from "@/schemas/calendar/events"

export const MeetingMediaTypeSchema = z.enum([
  "TRANSCRIPT",
  "VIDEO",
  "PARTICIPANT_EVENTS",
  "AUDIO",
  "METADATA",
])

export const MeetingMediaStatusSchema = z.enum(["PENDING", "STORED", "FAILED"])

export const SocialChannelSchema = z.enum(["LINKEDIN", "FACEBOOK"])

export const SocialPostStatusSchema = z.enum([
  "DRAFT",
  "READY",
  "POSTING",
  "POSTED",
  "FAILED",
])

export const MeetingMediaSchema = z.object({
  id: z.string(),
  type: MeetingMediaTypeSchema,
  status: MeetingMediaStatusSchema,
  expiresAt: z.string().nullable().optional(),
  available: z.boolean(),
})

export const MeetingInsightSchema = z.object({
  id: z.string(),
  summary: z.string().nullable().optional(),
  followUpEmail: z.string().nullable().optional(),
  generatedAt: z.string().nullable().optional(),
})

export const SocialPostSchema = z.object({
  id: z.string(),
  channel: SocialChannelSchema,
  status: SocialPostStatusSchema,
  content: z.string(),
  automationId: z.string().nullable().optional(),
  publishedAt: z.string().nullable().optional(),
  error: z.string().nullable().optional(),
  externalUrl: z.string().nullable().optional(),
})

export const RecallBotSchema = z
  .object({
    id: z.string(),
    status: RecallBotStatusSchema,
    meetingPlatform: MeetingPlatformSchema,
    meetingUrl: z.string(),
    joinAt: z.string(),
    metadata: z.record(z.unknown()).nullable().optional(),
  })
  .nullable()
  .optional()

export const MeetingDetailsSchema = z.object({
  event: CalendarEventApiSchema,
  recallBot: RecallBotSchema,
  media: z.array(MeetingMediaSchema),
  insight: MeetingInsightSchema.nullable().optional(),
  socialPosts: z.array(SocialPostSchema),
})

export const MeetingActivitySchema = z.object({
  viewerRole: z.enum(["owner", "guest"]),
  details: MeetingDetailsSchema,
  shareCount: z.number().int().nonnegative().optional(),
})

export const MeetingShareSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  invitedByUserId: z.string().nullable().optional(),
  createdAt: z.string(),
})

export const MeetingPreferenceSchema = z.object({
  leadMinutes: z.number().int().min(1).max(60),
})

export type MeetingDetails = z.infer<typeof MeetingDetailsSchema>
export type MeetingInsight = z.infer<typeof MeetingInsightSchema>
export type MeetingMedia = z.infer<typeof MeetingMediaSchema>
export type SocialPost = z.infer<typeof SocialPostSchema>
export type MeetingPreference = z.infer<typeof MeetingPreferenceSchema>
export type MeetingActivity = z.infer<typeof MeetingActivitySchema>
export type MeetingShare = z.infer<typeof MeetingShareSchema>
