export type NotificationSource = "api" | "calendar" | "meeting"

export type AppNotification = {
  id: string
  title: string
  body: string
  createdAt: string
  readAt: string | null
  type: string
  source: NotificationSource
  roomSlug?: string | null
  messageId?: string | null
  metadata?: Record<string, unknown> | null
}


