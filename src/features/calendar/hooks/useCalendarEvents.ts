"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { calendarEventsQuery } from "../queries"
import type { CalendarEventsQueryInput } from "../types"

export function useCalendarEvents(input: CalendarEventsQueryInput) {
  const queryClient = useQueryClient()
  const query = useQuery({
    ...calendarEventsQuery(input, queryClient),
    enabled: !!input.userId,
  })

  return {
    query,
    events: query.data?.events ?? [],
  }
}


