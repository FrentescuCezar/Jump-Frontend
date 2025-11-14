import type { QueryClient } from "@tanstack/react-query"
import {
  getCalendarEventsAction,
  getCalendarEventsDeltaSyncAction,
} from "@/app/[locale]/meetings/actions"
import type {
  CalendarEventsQueryInput,
  CalendarEventsQueryResult,
} from "../types"
import { calendarEventsKey } from "./keys"
import { mergeCalendarEvents } from "../utils/mergeCalendarEvents"

export async function calendarEventsQueryFn(
  input: CalendarEventsQueryInput,
  queryClient?: QueryClient,
): Promise<CalendarEventsQueryResult> {
  if (!queryClient) {
    return getCalendarEventsAction({ locale: input.locale })
  }

  const cached = queryClient.getQueryData<CalendarEventsQueryResult>(
    calendarEventsKey(input),
  )

  if (!cached?.serverTimestamp) {
    return getCalendarEventsAction({ locale: input.locale })
  }

  try {
    const delta = await getCalendarEventsDeltaSyncAction({
      locale: input.locale,
      updatedSince: cached.serverTimestamp,
    })

    return mergeCalendarEvents(cached, delta)
  } catch (error) {
    console.warn(
      "Calendar delta sync failed, falling back to full fetch",
      error,
    )
    return getCalendarEventsAction({ locale: input.locale })
  }
}
