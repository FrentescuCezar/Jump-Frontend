import type { CalendarEvent } from "../types"
import { getEventStartHours, getEventEndHours } from "./eventTime"
import {
  WEEK_VIEW_HEADER_HEIGHT,
  BASE_EVENT_HEIGHT,
  OFFSET_PER_EVENT,
} from "../constants/weekView"

/**
 * Calculates the top position of an event in pixels
 */
export function calculateEventTopPosition(
  event: CalendarEvent,
  rowHeights: number[]
): number {
  const eventStart = getEventStartHours(event)
  const startHour = Math.floor(eventStart)
  const hourOffset = eventStart % 1
  
  // Start from header height
  let top = WEEK_VIEW_HEADER_HEIGHT
  
  // Add heights of all previous hours
  for (let i = 0; i < startHour; i++) {
    top += rowHeights[i]
  }
  
  // Add offset within the current hour
  top += hourOffset * rowHeights[startHour]
  
  return top
}

/**
 * Calculates the height of an event in pixels based on row heights
 */
export function calculateEventHeight(
  event: CalendarEvent,
  rowHeights: number[]
): number {
  const eventStart = getEventStartHours(event)
  const eventEnd = getEventEndHours(event)
  const duration = eventEnd - eventStart
  
  const startHour = Math.floor(eventStart)
  const endHour = Math.floor(eventEnd)
  
  let heightSize = 0
  
  for (let h = startHour; h <= endHour && h < 24; h++) {
    if (h === startHour && h === endHour) {
      // Event fits entirely within one hour
      heightSize += duration * rowHeights[h]
    } else if (h === startHour) {
      // First hour - partial
      heightSize += (1 - (eventStart % 1)) * rowHeights[h]
    } else if (h === endHour) {
      // Last hour - partial
      heightSize += (eventEnd % 1) * rowHeights[h]
    } else {
      // Full hours in between
      heightSize += rowHeights[h]
    }
  }
  
  return Math.max(BASE_EVENT_HEIGHT, heightSize)
}

/**
 * Calculates horizontal offsets for overlapping events
 */
export function calculateEventOffsets(
  eventIndex: number,
  groupLength: number
): { leftOffset: number; rightOffset: number } {
  const leftOffset = eventIndex * OFFSET_PER_EVENT
  const rightOffset = (groupLength - 1 - eventIndex) * OFFSET_PER_EVENT
  
  return { leftOffset, rightOffset }
}

