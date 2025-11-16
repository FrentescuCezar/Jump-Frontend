import type {
  MeetingActivityQueryInput,
  MeetingDetailsQueryInput,
} from "../types"

export const meetingDetailsKey = (input: MeetingDetailsQueryInput) => [
  "meeting-details",
  input.meetingId,
  input.userId,
  input.locale,
]

export const meetingActivityKey = (input: MeetingActivityQueryInput) => [
  "meeting-activity",
  input.meetingId,
  input.viewerId ?? "anonymous",
]

export const meetingSharesKey = (meetingId: string) => [
  "meeting-shares",
  meetingId,
]

