import { z } from "zod"
import { env } from "@/config/env"
import { authFetch } from "@/lib/authFetch"
import { ApiError } from "@/lib/forms/apiError"
import {
  ChatHistoryResponseSchema,
  ChatNotificationSchema,
  ChatRoomSchema,
  ChatRoomsResponseSchema,
} from "@/schemas/examples/chat"

const chatBaseUrl = () => {
  if (!env.backendUrl) {
    throw new Error("BACKEND_URL is not configured")
  }
  return `${env.backendUrl}/examples/chat`
}

const notificationsUrl = () => {
  if (!env.backendUrl) {
    throw new Error("BACKEND_URL is not configured")
  }
  return `${env.backendUrl}/examples/notifications`
}

export async function fetchChatRooms() {
  const response = await authFetch<unknown>(`${chatBaseUrl()}/rooms`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
  return ChatRoomsResponseSchema.parse(response)
}

export async function fetchChatHistory(
  roomSlug: string,
  params?: { before?: string; limit?: number },
) {
  const search = new URLSearchParams()
  if (params?.before) {
    search.set("before", params.before)
  }
  if (params?.limit) {
    search.set("limit", params.limit.toString())
  }
  const response = await authFetch<unknown>(
    `${chatBaseUrl()}/rooms/${roomSlug}/messages?${search.toString()}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  )
  return ChatHistoryResponseSchema.parse(response)
}

export async function requestChatToken() {
  if (!env.backendUrl) {
    throw new Error("BACKEND_URL is not configured")
  }
  const response = await authFetch<{ token: string }>(
    `${env.backendUrl}/auth/chat-token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
  )
  return response.token
}

export async function fetchNotifications() {
  try {
    const response = await authFetch<unknown>(notificationsUrl(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
    return z.array(ChatNotificationSchema).parse(response)
  } catch (error) {
    // Handle network errors (server unavailable) and auth errors (401) gracefully
    if (error instanceof ApiError && (error.status === 0 || error.status === 401)) {
      return []
    }
    // Log other errors but don't crash - return empty array
    console.error("Failed to fetch notifications:", error)
    return []
  }
}

export async function markNotificationRead(notificationId: string) {
  await authFetch(`${notificationsUrl()}/${notificationId}/read`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
}
