import type { ChatNotification } from "@/schemas/examples/chat"
import type {
  AppNotification,
  NotificationSource,
} from "@/features/notifications/types"

export function toAppNotification(
  notification: ChatNotification,
): AppNotification {
  const source = resolveNotificationSource(notification)
  return {
    id: notification.id,
    title: notification.title,
    body: notification.body,
    createdAt: notification.createdAt,
    readAt: notification.readAt,
    type: notification.type,
    source,
    roomSlug: notification.roomSlug,
    messageId: notification.messageId,
    metadata: notification.payload ?? {
      roomSlug: notification.roomSlug,
      messageId: notification.messageId,
    },
  }
}

function resolveNotificationSource(
  notification: ChatNotification,
): NotificationSource {
  if (notification.type?.startsWith("calendar:")) {
    return "calendar"
  }
  if (notification.type?.startsWith("meeting-chat:")) {
    return "meeting"
  }
  if (
    notification.payload &&
    typeof notification.payload === "object" &&
    "source" in notification.payload &&
    notification.payload.source === "calendar"
  ) {
    return "calendar"
  }
  if (
    notification.payload &&
    typeof notification.payload === "object" &&
    "source" in notification.payload &&
    notification.payload.source === "meeting"
  ) {
    return "meeting"
  }
  return "api"
}


