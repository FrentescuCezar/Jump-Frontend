import { meetingsBaseUrl } from "../api"
import { authFetch } from "@/lib/authFetch"
import {
  MeetingChatHistorySchema,
  MeetingChatMessageSchema,
} from "@/schemas/meetings/chat"

export async function fetchMeetingChatHistory(
  meetingId: string,
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
    `${meetingsBaseUrl()}/${meetingId}/chat/messages?${search.toString()}`,
  )
  return MeetingChatHistorySchema.parse(response)
}

export async function markMeetingChatMessagesRead(
  meetingId: string,
  messageIds: string[],
) {
  if (!messageIds.length) {
    return []
  }
  const response = await authFetch<unknown>(
    `${meetingsBaseUrl()}/${meetingId}/chat/read`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messageIds }),
    },
  )
  return MeetingChatMessageSchema.pick({ id: true, readBy: true })
    .array()
    .parse(response)
}


