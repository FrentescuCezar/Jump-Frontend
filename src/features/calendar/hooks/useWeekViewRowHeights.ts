import { useMemo } from "react"
import type { CalendarEvent } from "../types"
import { getOverlappingGroups } from "../utils/eventGrouping"
import {
  getEventStartHours,
  getEventEndHours,
  getEventDurationHours,
} from "../utils/eventTime"
import { isSameDay } from "date-fns"
import {
  BASE_ROW_HEIGHT,
  EMPTY_ROW_HEIGHT,
  BASE_EVENT_HEIGHT,
  HEIGHT_PER_OVERLAP,
} from "../constants/weekView"

/**
 * Calculates dynamic row heights for each hour based on overlapping events
 * Rows grow taller when events overlap to accommodate side-by-side positioning
 * Matches v0 implementation exactly: 80 + (group.length - 1) * 20
 */
export function useWeekViewRowHeights(
  events: CalendarEvent[],
  weekDays: Date[],
): number[] {
  return useMemo(() => {
    const rowHeights: number[] = new Array(24).fill(EMPTY_ROW_HEIGHT)

    // For each hour, check all days for overlapping groups
    for (let hour = 0; hour < 24; hour++) {
      let maxHeightNeeded = EMPTY_ROW_HEIGHT
      let hasAnyEvents = false

      for (let dayIdx = 0; dayIdx < weekDays.length; dayIdx++) {
        const day = weekDays[dayIdx]
        // Get events for this day
        const dayEvents = events.filter((event) => {
          const eventDate = new Date(event.startTime)
          return isSameDay(eventDate, day)
        })

        // Get overlapping groups (already filters out all-day events)
        const { timedGroups } = getOverlappingGroups(dayEvents)

        // Check each group to see if it overlaps this hour
        timedGroups.forEach((group) => {
          const groupOverlapsHour = group.some((event) => {
            const eventStart = getEventStartHours(event)
            const eventEnd = getEventEndHours(event)
            return eventStart < hour + 1 && eventEnd > hour
          })

          if (groupOverlapsHour) {
            hasAnyEvents = true
            // If group overlaps this hour and has multiple events, increase height
            if (group.length > 1) {
              // Match v0 exactly: 80 + (group.length - 1) * 20
              const neededHeight =
                BASE_EVENT_HEIGHT + (group.length - 1) * HEIGHT_PER_OVERLAP
              maxHeightNeeded = Math.max(maxHeightNeeded, neededHeight)
            } else {
              // Single event in this hour - use base row height
              maxHeightNeeded = Math.max(maxHeightNeeded, BASE_ROW_HEIGHT)
            }
          }
        })
      }

      // If no events in this hour, keep it at empty row height (already set)
      // Otherwise use the calculated height
      rowHeights[hour] = hasAnyEvents ? maxHeightNeeded : EMPTY_ROW_HEIGHT
    }

    return rowHeights
  }, [events, weekDays])
}
