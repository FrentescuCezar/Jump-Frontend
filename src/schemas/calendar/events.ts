import { z } from "zod"

export const RecallBotStatusSchema = z.enum([
  "SCHEDULED",
  "JOINING",
  "IN_CALL",
  "DONE",
  "FATAL",
  "CANCELLED",
])

export const MeetingPlatformSchema = z.enum([
  "ZOOM",
  "GOOGLE_MEET",
  "MICROSOFT_TEAMS",
  "UNKNOWN",
])

export const ConnectedProviderSchema = z.enum([
  "GOOGLE_CALENDAR",
  "LINKEDIN",
  "FACEBOOK",
])

export const CalendarEventApiSchema = z.object({
  id: z.string(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  startTime: z.string(),
  endTime: z.string(),
  timezone: z.string().nullable().optional(),
  meetingUrl: z.string().nullable().optional(),
  meetingPlatform: MeetingPlatformSchema,
  htmlLink: z.string().nullable().optional(),
  calendarTitle: z.string().nullable().optional(),
  provider: ConnectedProviderSchema,
  accountLabel: z.string().nullable().optional(),
  notetakerEnabled: z.boolean(),
  status: z.string(),
  botStatus: RecallBotStatusSchema.nullable().optional(),
  reminders: z.record(z.unknown()).nullable().optional(),
  recurrence: z.array(z.string()).nullable().optional(),
  creatorEmail: z.string().nullable().optional(),
  creatorDisplayName: z.string().nullable().optional(),
})

export const CalendarEventsResponseSchema = z.object({
  events: z.array(CalendarEventApiSchema),
  serverTimestamp: z.string(),
  providerSyncedAt: z.string().nullable().optional(),
})

export const CalendarEventsDeltaResponseSchema = z.object({
  events: z.array(CalendarEventApiSchema),
  deletedIds: z.array(z.string()),
  serverTimestamp: z.string(),
  providerSyncedAt: z.string().nullable().optional(),
})

export type CalendarEventApi = z.infer<typeof CalendarEventApiSchema>
export type CalendarEventsResponse = z.infer<
  typeof CalendarEventsResponseSchema
>
export type CalendarEventsDeltaResponse = z.infer<
  typeof CalendarEventsDeltaResponseSchema
>
