import type {
  CalendarEventApi,
  CalendarEventsDeltaResponse,
  CalendarEventsResponse,
} from "@/schemas/calendar/events"

export type CalendarEvent = CalendarEventApi & {
  rangeLabel: string
}

export type CalendarEventsQueryResult = {
  events: CalendarEvent[]
  serverTimestamp: string
  providerSyncedAt: string | null
}

export type CalendarEventsDeltaResult = {
  events: CalendarEvent[]
  deletedIds: string[]
  serverTimestamp: string
  providerSyncedAt: string | null
}

export type CalendarEventsResponsePayload = CalendarEventsResponse
export type CalendarEventsDeltaResponsePayload = CalendarEventsDeltaResponse

export type ConnectedProvider = CalendarEventApi["provider"]
export type MeetingPlatform = CalendarEventApi["meetingPlatform"]
export type RecallBotStatus = CalendarEventApi["botStatus"]

export type CalendarEventsQueryInput = {
  userId: string
  locale: string
  window?: "upcoming" | "past"
}

export type CalendarSyncFailure = {
  accountId: string
  message: string
}

export type CalendarSyncSummary = {
  success: boolean
  totalAccounts: number
  syncedAccounts: number
  skippedAccounts: number
  failedAccounts: CalendarSyncFailure[]
}

