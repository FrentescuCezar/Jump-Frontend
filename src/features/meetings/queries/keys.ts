import type { MeetingDetailsQueryInput } from "../types"

export const meetingDetailsKey = (input: MeetingDetailsQueryInput) => [
  "meeting-details",
  input.meetingId,
  input.userId,
  input.locale,
]

