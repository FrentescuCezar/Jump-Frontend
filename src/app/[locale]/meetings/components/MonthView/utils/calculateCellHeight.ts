import { BASE_CELL_HEIGHT, HEIGHT_PER_EVENT } from "../constants/monthView"

/**
 * Calculates the height of a calendar cell based on the number of events
 */
export function calculateCellHeight(eventCount: number): number {
  return Math.max(
    BASE_CELL_HEIGHT,
    BASE_CELL_HEIGHT + (eventCount - 2) * HEIGHT_PER_EVENT,
  )
}

