import type { CalendarEvent } from "../types"
import { getEventStartHours, getEventEndHours, getEventDurationHours, eventsOverlap } from "./eventTime"

/**
 * Groups events that overlap with each other
 * Matches v0 implementation: separates timed events from all-day events
 * Returns { timedGroups, allDayEvents }
 */
export function getOverlappingGroups(dayEvents: CalendarEvent[]): { timedGroups: CalendarEvent[][], allDayEvents: CalendarEvent[] } {
  // Separate all-day events (duration === 24 hours)
  const allDayEvents = dayEvents.filter(e => {
    const duration = getEventDurationHours(e)
    return duration === 24
  })
  
  const timedEvents = dayEvents.filter(e => {
    const duration = getEventDurationHours(e)
    return duration !== 24
  })
  
  if (timedEvents.length === 0) {
    return { timedGroups: [], allDayEvents }
  }
  
  // Sort timed events by start time
  const sorted = [...timedEvents].sort((a, b) => {
    const aStart = getEventStartHours(a)
    const bStart = getEventStartHours(b)
    return aStart - bStart
  })
  
  const groups: CalendarEvent[][] = []
  
  sorted.forEach(event => {
    const eventEnd = getEventEndHours(event)
    
    let addedToGroup = false
    for (const group of groups) {
      const overlaps = group.some(existing => {
        const existingEnd = getEventEndHours(existing)
        const existingStart = getEventStartHours(existing)
        const eventStart = getEventStartHours(event)
        return !(eventEnd <= existingStart || eventStart >= existingEnd)
      })
      
      if (overlaps) {
        group.push(event)
        addedToGroup = true
        break
      }
    }
    
    if (!addedToGroup) {
      groups.push([event])
    }
  })
  
  return { timedGroups: groups, allDayEvents }
}

