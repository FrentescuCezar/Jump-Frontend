import { WEEK_VIEW_HEADER_HEIGHT } from "@/features/calendar/constants/weekView"

/**
 * Calculates the hour (with decimal precision) from a Y position
 * Returns null if position is outside the calendar bounds
 */
export function getHourFromYPosition(
  y: number,
  calendarRef: React.RefObject<HTMLDivElement>,
  rowHeights: number[],
): number | null {
  if (!calendarRef.current) return null

  const rect = calendarRef.current.getBoundingClientRect()
  // Account for the time column header when calculating relative position
  const relativeY = y - rect.top - WEEK_VIEW_HEADER_HEIGHT

  if (relativeY < 0) return null

  let cumulativeTop = 0
  for (let hour = 0; hour < 24; hour++) {
    const rowHeight = rowHeights[hour]
    if (relativeY >= cumulativeTop && relativeY < cumulativeTop + rowHeight) {
      // Calculate the exact hour with decimal precision
      const positionInRow = relativeY - cumulativeTop
      const hourDecimal = hour + positionInRow / rowHeight
      return Math.min(23.99, Math.max(0, hourDecimal))
    }
    cumulativeTop += rowHeight
  }

  return null
}

