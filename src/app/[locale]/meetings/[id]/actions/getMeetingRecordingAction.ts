"use server"

import { fetchMeetingRecording } from "@/features/meetings/api"

type GetMeetingRecordingActionInput = {
  meetingId: string
}

export async function getMeetingRecordingAction(
  input: GetMeetingRecordingActionInput,
) {
  return fetchMeetingRecording(input.meetingId)
}



