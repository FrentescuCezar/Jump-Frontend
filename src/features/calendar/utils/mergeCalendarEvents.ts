import type {
  CalendarEventsDeltaResult,
  CalendarEventsQueryResult,
} from "../types"

export function mergeCalendarEvents(
  current: CalendarEventsQueryResult,
  delta: CalendarEventsDeltaResult,
): CalendarEventsQueryResult {
  const eventsMap = new Map(current.events.map((event) => [event.id, event]))

  for (const updated of delta.events) {
    eventsMap.set(updated.id, updated)
  }

  for (const id of delta.deletedIds) {
    eventsMap.delete(id)
  }

  const events = Array.from(eventsMap.values()).sort((a, b) =>
    a.startTime.localeCompare(b.startTime),
  )

  return {
    events,
    serverTimestamp: delta.serverTimestamp,
  }
}


