import { useMemo } from "react"
import type { CalendarEvent } from "../types"
import { getOverlappingGroups } from "../utils/eventGrouping"
import { isSameDay } from "date-fns"

/**
 * Calculates layout information for week view events
 * Returns events grouped by day with overlapping groups
 * Matches v0: returns timedGroups only (all-day events handled separately)
 */
export function useWeekViewLayout(
  events: CalendarEvent[],
  weekDays: Date[]
) {
  return useMemo(() => {
    const dayLayouts: Record<string, CalendarEvent[][]> = {}
    
    weekDays.forEach(day => {
      const dayKey = day.toISOString()
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.startTime)
        return isSameDay(eventDate, day)
      })
      
      const { timedGroups } = getOverlappingGroups(dayEvents)
      dayLayouts[dayKey] = timedGroups
    })
    
    return dayLayouts
  }, [events, weekDays])
}

