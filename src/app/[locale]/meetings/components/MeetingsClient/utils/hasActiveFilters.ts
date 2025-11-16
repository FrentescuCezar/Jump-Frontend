import type { MeetingsFilters } from "@/features/calendar/store/meetingsView"

/**
 * Checks if any filters are currently active
 */
export function hasActiveFilters(filters: MeetingsFilters): boolean {
  return (
    (filters.meetingPlatforms?.length ?? 0) > 0 ||
    (filters.botStatuses?.length ?? 0) > 0 ||
    (filters.emails?.length ?? 0) > 0 ||
    (filters.searchQuery?.length ?? 0) > 0 ||
    filters.hourRange !== null ||
    filters.dateRange?.start !== null ||
    filters.dateRange?.end !== null
  )
}

/**
 * Counts the number of active filter groups
 */
export function countActiveFilters(filters: MeetingsFilters): number {
  return [
    filters.meetingPlatforms?.length ?? 0,
    filters.botStatuses?.length ?? 0,
    filters.emails?.length ?? 0,
    (filters.searchQuery?.length ?? 0) > 0 ? 1 : 0,
    filters.hourRange ? 1 : 0,
    filters.dateRange?.start || filters.dateRange?.end ? 1 : 0,
  ].reduce((a, b) => a + b, 0)
}

