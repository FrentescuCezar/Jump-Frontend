import type { CalendarEvent } from "@/features/calendar/types"

/**
 * Filters and sorts events for a specific date
 */
export function getEventsForDate(
  events: CalendarEvent[],
  date: Date,
): CalendarEvent[] {
  return events
    .filter((event) => {
      const eventDate = new Date(event.startTime)
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      )
    })
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    )
}

