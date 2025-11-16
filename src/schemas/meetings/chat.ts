import { z } from "zod"

export const MeetingChatMessageSchema = z.object({
  id: z.string(),
  meetingId: z.string(),
  senderId: z.string(),
  senderName: z.string(),
  body: z.string(),
  createdAt: z.string(),
  readBy: z.array(z.string()).default([]),
  clientMessageId: z.string().optional(),
})

export const MeetingChatHistorySchema = z.object({
  meetingId: z.string(),
  messages: z.array(MeetingChatMessageSchema),
  nextCursor: z.string().nullable(),
})

export type MeetingChatMessage = z.infer<typeof MeetingChatMessageSchema>
export type MeetingChatHistory = z.infer<typeof MeetingChatHistorySchema>

