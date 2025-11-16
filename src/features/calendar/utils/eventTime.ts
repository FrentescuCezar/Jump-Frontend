import type { CalendarEvent } from "../types"

/**
 * Converts a Date to hours (with decimal for minutes)
 */
export function getHoursFromDate(date: Date): number {
  return date.getHours() + date.getMinutes() / 60
}

/**
 * Calculates the precise duration of an event in hours.
 * Handles multi-day events and guards against provider glitches where
 * endTime might precede startTime.
 */
export function getEventDurationHours(event: CalendarEvent): number {
  if (!event.endTime) {
    return 1
  }

  const start = new Date(event.startTime)
  const end = new Date(event.endTime)
  const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60)

  return Math.max(duration, 0)
}

/**
 * Gets the start time of an event in hours
 */
export function getEventStartHours(event: CalendarEvent): number {
  return getHoursFromDate(new Date(event.startTime))
}

/**
 * Gets the end time of an event in hours relative to its start.
 * When an event crosses midnight we extend past 24 so overlap math remains accurate.
 */
export function getEventEndHours(event: CalendarEvent): number {
  return getEventStartHours(event) + getEventDurationHours(event)
}

/**
 * Checks if two events overlap in time
 */
export function eventsOverlap(
  event1: CalendarEvent,
  event2: CalendarEvent,
): boolean {
  const start1 = getEventStartHours(event1)
  const end1 = getEventEndHours(event1)
  const start2 = getEventStartHours(event2)
  const end2 = getEventEndHours(event2)

  // Events overlap if they don't have a gap between them
  return !(end1 <= start2 || start1 >= end2)
}

/**
 * Checks if an event overlaps with a specific hour
 */
export function eventOverlapsHour(event: CalendarEvent, hour: number): boolean {
  const eventStart = getEventStartHours(event)
  const eventEnd = getEventEndHours(event)
  // Event overlaps hour if it starts before hour+1 and ends after hour
  return eventStart < hour + 1 && eventEnd > hour
}
