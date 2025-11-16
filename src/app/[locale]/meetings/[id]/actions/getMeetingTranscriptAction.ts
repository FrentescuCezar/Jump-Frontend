"use server"

import { fetchMeetingTranscript } from "@/features/meetings/api"

type GetMeetingTranscriptActionInput = {
  meetingId: string
}

export async function getMeetingTranscriptAction(
  input: GetMeetingTranscriptActionInput,
) {
  return fetchMeetingTranscript(input.meetingId)
}




