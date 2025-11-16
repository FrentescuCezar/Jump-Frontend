"use server"

import { fetchMeetingChatHistory } from "@/features/meetings/chat/api"

type GetMeetingChatHistoryActionInput = {
  meetingId: string
  before?: string
  limit?: number
}

export async function getMeetingChatHistoryAction(
  input: GetMeetingChatHistoryActionInput,
) {
  return fetchMeetingChatHistory(input.meetingId, {
    before: input.before,
    limit: input.limit,
  })
}


