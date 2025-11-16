"use server"

import { fetchMeetingActivity } from "@/features/meetings/api"

type GetMeetingActivityInput = {
  meetingId: string
}

export async function getMeetingActivityAction(
  input: GetMeetingActivityInput,
) {
  return fetchMeetingActivity(input.meetingId)
}

