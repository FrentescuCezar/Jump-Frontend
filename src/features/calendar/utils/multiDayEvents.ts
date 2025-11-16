import type { CalendarEvent } from "../types"
import { startOfWeek, endOfWeek, isSameDay } from "date-fns"
import { getEventStartHours, getEventEndHours, getEventDurationHours } from "./eventTime"

export type MultiDaySegmentType = "start" | "middle" | "end"

export interface MultiDayCalendarEvent extends CalendarEvent {
  isMultiDaySegment?: boolean
  originalEventId?: string
  segmentType?: MultiDaySegmentType
}

/**
 * Checks if a date is within the week range
 */
function isDateInWeek(date: Date, weekStart: Date): boolean {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
  const dayIndex = Math.floor((date.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24))
  return dayIndex >= 0 && dayIndex < 7
}

/**
 * Splits multi-day events into segments for week view
 * Matches v0 implementation: creates separate segments for each day
 * NOTE: All-day events (duration === 24) should be filtered out before calling this
 */
export function splitMultiDayEvents(
  events: CalendarEvent[],
  weekStart: Date
): MultiDayCalendarEvent[] {
  const result: MultiDayCalendarEvent[] = []

  events.forEach((event) => {
    // Skip all-day events - they should be handled separately
    const duration = getEventDurationHours(event)
    if (duration === 24) {
      return
    }

    const startDate = new Date(event.startTime)
    const endDate = new Date(event.endTime)

    // Check if event spans multiple days
    if (!isSameDay(startDate, endDate)) {
      const totalDuration = duration
      const startHours = getEventStartHours(event)
      const hoursInFirstDay = 24 - startHours

      // First day segment
      if (isDateInWeek(startDate, weekStart)) {
        result.push({
          ...event,
          id: `${event.id}-${startDate.toISOString()}`,
          endTime: new Date(startDate.getTime() + hoursInFirstDay * 60 * 60 * 1000).toISOString(),
          isMultiDaySegment: true,
          originalEventId: event.id,
          segmentType: "start",
        })
      }

      // Middle and end day segments
      let remainingHours = totalDuration - hoursInFirstDay
      let currentDate = new Date(startDate)
      currentDate.setDate(currentDate.getDate() + 1)

      while (currentDate < endDate && remainingHours > 0) {
        const hoursThisDay = Math.min(24, remainingHours)
        const segmentEndDate = new Date(currentDate)
        segmentEndDate.setHours(segmentEndDate.getHours() + hoursThisDay)

        if (isDateInWeek(currentDate, weekStart)) {
          const isLastDay = isSameDay(currentDate, endDate) || remainingHours <= 24
          result.push({
            ...event,
            id: `${event.id}-${currentDate.toISOString()}`,
            startTime: new Date(currentDate.setHours(0, 0, 0, 0)).toISOString(),
            endTime: segmentEndDate.toISOString(),
            isMultiDaySegment: true,
            originalEventId: event.id,
            segmentType: isLastDay ? "end" : "middle",
          })
        }

        remainingHours -= hoursThisDay
        currentDate.setDate(currentDate.getDate() + 1)
      }
    } else {
      // Single day event - add as-is if it's in the week
      if (isDateInWeek(startDate, weekStart)) {
        result.push(event)
      }
    }
  })

  return result
}

/**
 * Separates all-day events from timed events
 * Returns { allDayEvents, timedEvents }
 */
export function separateAllDayEvents(events: CalendarEvent[]): {
  allDayEvents: CalendarEvent[]
  timedEvents: CalendarEvent[]
} {
  const allDayEvents: CalendarEvent[] = []
  const timedEvents: CalendarEvent[] = []

  events.forEach((event) => {
    const duration = getEventDurationHours(event)
    if (duration === 24) {
      allDayEvents.push(event)
    } else {
      timedEvents.push(event)
    }
  })

  return { allDayEvents, timedEvents }
}

