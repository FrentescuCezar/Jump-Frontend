import { useEffect, useMemo, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  formatISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns"
import { calendarEventsQuery } from "../queries"
import type { CalendarEvent } from "../types"

type UseCalendarEventsRangeOptions = {
  userId: string
  locale: string
  date: Date
  viewType: "week" | "month"
}

export function useCalendarEventsRange({
  userId,
  locale,
  date,
  viewType,
}: UseCalendarEventsRangeOptions) {
  const startDate =
    viewType === "week"
      ? startOfWeek(date, { weekStartsOn: 1 })
      : startOfMonth(date)
  const endDate =
    viewType === "week"
      ? endOfWeek(date, { weekStartsOn: 1 })
      : endOfMonth(date)

  // For now, we'll fetch both upcoming and past events and filter client-side
  // In the future, we can add a date range query to the API
  const upcomingQuery = useQuery(
    calendarEventsQuery({
      userId,
      locale,
      window: "upcoming",
    }),
  )

  const pastQuery = useQuery(
    calendarEventsQuery({
      userId,
      locale,
      window: "past",
    }),
  )

  const allEvents: CalendarEvent[] = [
    ...(upcomingQuery.data?.events ?? []),
    ...(pastQuery.data?.events ?? []),
  ]

  // Filter events by date range
  const filteredEvents = allEvents.filter((event) => {
    const eventStart = new Date(event.startTime)
    return eventStart >= startDate && eventStart <= endDate
  })

  const rangeKey = useMemo(() => {
    const startKey = formatISO(startDate, { representation: "date" })
    const endKey = formatISO(endDate, { representation: "date" })
    return `${viewType}:${startKey}:${endKey}`
  }, [viewType, startDate, endDate])

  const eventsCacheRef = useRef<Record<string, CalendarEvent[]>>({})
  const cachedEventsForRange = eventsCacheRef.current[rangeKey]

  const isFetchingAny = upcomingQuery.isFetching || pastQuery.isFetching

  useEffect(() => {
    if (isFetchingAny) {
      return
    }

    eventsCacheRef.current[rangeKey] = filteredEvents
  }, [filteredEvents, rangeKey, isFetchingAny])

  const eventsForRange =
    isFetchingAny && cachedEventsForRange && filteredEvents.length === 0
      ? cachedEventsForRange
      : filteredEvents

  return {
    events: eventsForRange,
    isLoading: upcomingQuery.isLoading || pastQuery.isLoading,
    isFetching: isFetchingAny,
    error: upcomingQuery.error || pastQuery.error,
    refetch: () => Promise.all([upcomingQuery.refetch(), pastQuery.refetch()]),
  }
}
