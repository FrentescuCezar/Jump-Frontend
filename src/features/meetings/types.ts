import type {
  MeetingActivity,
  MeetingDetails,
  MeetingShare,
} from "@/schemas/meetings/details"

export type MeetingDetailsQueryInput = {
  meetingId: string
  userId: string
  locale: string
}

export type MeetingDetailsQueryResult = MeetingDetails

export type MeetingActivityQueryInput = {
  meetingId: string
  viewerId?: string | null
}

export type MeetingActivityQueryResult = MeetingActivity

export type MeetingShareList = MeetingShare[]

