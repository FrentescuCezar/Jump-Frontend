"use server"

import { fetchMeetingDetails } from "@/features/meetings/api"

type GetMeetingDetailsActionInput = {
  meetingId: string
}

export async function getMeetingDetailsAction(
  input: GetMeetingDetailsActionInput,
) {
  return fetchMeetingDetails(input.meetingId)
}

