import type { CalendarEvent } from "@/features/calendar/types"
import type { MeetingsFilters } from "@/features/calendar/store/meetingsView"

/**
 * Filters calendar events based on the provided filter criteria
 */
export function filterEvents(
  events: CalendarEvent[],
  filters: MeetingsFilters,
): CalendarEvent[] {
  let filtered = events

  // Search filter
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase()
    filtered = filtered.filter(
      (event) =>
        event.title?.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.calendarTitle?.toLowerCase().includes(query),
    )
  }

  // Platform filter
  if (filters.meetingPlatforms.length > 0) {
    filtered = filtered.filter(
      (event) =>
        event.meetingPlatform &&
        filters.meetingPlatforms.includes(event.meetingPlatform),
    )
  }

  // Bot status filter
  if (filters.botStatuses.length > 0) {
    filtered = filtered.filter(
      (event) =>
        event.botStatus && filters.botStatuses.includes(event.botStatus),
    )
  }

  // Email filter
  if (filters.emails && filters.emails.length > 0) {
    filtered = filtered.filter(
      (event) =>
        event.creatorEmail && filters.emails.includes(event.creatorEmail),
    )
  }

  // Hour range filter
  if (filters.hourRange) {
    filtered = filtered.filter((event) => {
      if (!event.startTime) return false
      const eventDate = new Date(event.startTime)
      const eventHour = eventDate.getHours()
      const eventMinutes = eventDate.getMinutes()
      const eventTimeInMinutes = eventHour * 60 + eventMinutes

      const [startHour, startMin] = filters
        .hourRange!.start.split(":")
        .map(Number)
      const [endHour, endMin] = filters.hourRange!.end.split(":").map(Number)
      const startTimeInMinutes = startHour * 60 + startMin
      const endTimeInMinutes = endHour * 60 + endMin

      return (
        eventTimeInMinutes >= startTimeInMinutes &&
        eventTimeInMinutes <= endTimeInMinutes
      )
    })
  }

  // Date range filter
  if (filters.dateRange.start || filters.dateRange.end) {
    filtered = filtered.filter((event) => {
      if (!event.startTime) return false
      const eventDate = new Date(event.startTime)
      eventDate.setHours(0, 0, 0, 0)

      if (filters.dateRange.start) {
        const startDate = new Date(filters.dateRange.start)
        startDate.setHours(0, 0, 0, 0)
        if (eventDate < startDate) return false
      }

      if (filters.dateRange.end) {
        const endDate = new Date(filters.dateRange.end)
        endDate.setHours(23, 59, 59, 999)
        if (eventDate > endDate) return false
      }

      return true
    })
  }

  return filtered
}


