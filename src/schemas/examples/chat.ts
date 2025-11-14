import { z } from "zod"

export const ChatMessageSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  roomSlug: z.string(),
  senderId: z.string(),
  senderName: z.string(),
  body: z.string(),
  createdAt: z.string(),
  readBy: z.array(z.string()).default([]),
})

export const ChatRoomSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  theme: z.string(),
  participants: z.array(z.string()),
  lastMessage: ChatMessageSchema.nullable(),
  unreadCount: z.number(),
})

export const ChatRoomsResponseSchema = z.array(ChatRoomSchema)

export const ChatHistoryResponseSchema = z.object({
  room: ChatRoomSchema,
  messages: z.array(ChatMessageSchema),
  nextCursor: z.string().nullable(),
})

export const ChatNotificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.string(),
  title: z.string(),
  body: z.string(),
  roomSlug: z.string().nullable(),
  messageId: z.string().nullable(),
  readAt: z.string().nullable(),
  createdAt: z.string(),
})

export type ChatMessage = z.infer<typeof ChatMessageSchema>
export type ChatRoom = z.infer<typeof ChatRoomSchema>
export type ChatHistoryResponse = z.infer<typeof ChatHistoryResponseSchema>
export type ChatNotification = z.infer<typeof ChatNotificationSchema>

