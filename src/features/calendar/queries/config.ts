import { CALENDAR_DB_REFRESH_INTERVAL_MS } from "@/features/calendar/constants"

export const calendarEventsQueryConfig = {
  staleTime: 0,
  gcTime: 10 * 60_000,
  refetchInterval: CALENDAR_DB_REFRESH_INTERVAL_MS,
  refetchIntervalInBackground: true,
  structuralSharing: true,
} as const
