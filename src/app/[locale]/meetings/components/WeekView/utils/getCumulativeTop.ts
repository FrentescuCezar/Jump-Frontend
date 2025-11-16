import { WEEK_VIEW_HEADER_HEIGHT } from "@/features/calendar/constants/weekView"

/**
 * Calculates the cumulative top position for a given hour
 * based on the heights of all previous hour rows
 */
export function getCumulativeTop(hour: number, rowHeights: number[]): number {
  let top = WEEK_VIEW_HEADER_HEIGHT
  for (let i = 0; i < hour; i++) {
    top += rowHeights[i]
  }
  return top
}


