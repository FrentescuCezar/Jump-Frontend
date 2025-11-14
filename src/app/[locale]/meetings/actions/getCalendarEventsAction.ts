"use server"

import { fetchCalendarEvents } from "@/features/calendar/api"
import type { CalendarEventsQueryResult } from "@/features/calendar/types"
import { formatMeetingTimeRange } from "@/features/calendar/utils/formatMeetingTimeRange"

type GetCalendarEventsActionInput = {
  locale: string
}

export async function getCalendarEventsAction(
  input: GetCalendarEventsActionInput,
): Promise<CalendarEventsQueryResult> {
  const response = await fetchCalendarEvents()
  return {
    events: response.events.map((event) => ({
      ...event,
      rangeLabel: formatMeetingTimeRange(event, input.locale),
    })),
    serverTimestamp: response.serverTimestamp,
  }
}


