"use server"

import { fetchCalendarEventsDelta } from "@/features/calendar/api"
import type { CalendarEventsDeltaResult } from "@/features/calendar/types"
import { formatMeetingTimeRange } from "@/features/calendar/utils/formatMeetingTimeRange"

type CalendarEventsDeltaInput = {
  locale: string
  updatedSince: string
}

export async function getCalendarEventsDeltaSyncAction(
  input: CalendarEventsDeltaInput,
): Promise<CalendarEventsDeltaResult> {
  const response = await fetchCalendarEventsDelta(input.updatedSince)

  return {
    events: response.events.map((event) => ({
      ...event,
      rangeLabel: formatMeetingTimeRange(event, input.locale),
    })),
    deletedIds: response.deletedIds,
    serverTimestamp: response.serverTimestamp,
  }
}


