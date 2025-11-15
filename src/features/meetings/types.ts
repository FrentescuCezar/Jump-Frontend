import type { MeetingDetails } from "@/schemas/meetings/details"

export type MeetingDetailsQueryInput = {
  meetingId: string
  userId: string
  locale: string
}

export type MeetingDetailsQueryResult = MeetingDetails

