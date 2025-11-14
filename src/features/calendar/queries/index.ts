import type { QueryClient } from "@tanstack/react-query"
import type { CalendarEventsQueryInput } from "../types"
import { calendarEventsQueryFn } from "./calendarEventsQueryFn"
import { calendarEventsKey } from "./keys"
import { calendarEventsQueryConfig } from "./config"

export { calendarEventsKey } from "./keys"

export const calendarEventsQuery = (
  input: CalendarEventsQueryInput,
  queryClient?: QueryClient,
) => ({
  queryKey: calendarEventsKey(input),
  queryFn: () => calendarEventsQueryFn(input, queryClient),
  ...calendarEventsQueryConfig,
})


