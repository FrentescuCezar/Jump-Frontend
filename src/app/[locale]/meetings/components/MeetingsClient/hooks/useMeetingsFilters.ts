import { useMemo } from "react"
import type { CalendarEvent } from "@/features/calendar/types"
import { filterEvents } from "../utils/filterEvents"
import {
  getUniquePlatforms,
  getUniqueBotStatuses,
  getUniqueEmails,
} from "../utils/getUniqueFilterValues"
import { hasActiveFilters, countActiveFilters } from "../utils/hasActiveFilters"
import { useMeetingsViewStore } from "@/features/calendar/store/meetingsView"

/**
 * Hook for managing meetings filters
 */
export function useMeetingsFilters(events: CalendarEvent[]) {
  const filters = useMeetingsViewStore((state) => state.filters)
  const setFilters = useMeetingsViewStore((state) => state.setFilters)
  const resetFilters = useMeetingsViewStore((state) => state.resetFilters)

  const uniquePlatforms = useMemo(
    () => getUniquePlatforms(events),
    [events],
  )
  const uniqueBotStatuses = useMemo(
    () => getUniqueBotStatuses(events),
    [events],
  )
  const uniqueEmails = useMemo(() => getUniqueEmails(events), [events])

  const filteredEvents = useMemo(
    () => filterEvents(events, filters),
    [events, filters],
  )

  const hasActive = useMemo(() => hasActiveFilters(filters), [filters])
  const activeFilterCount = useMemo(
    () => countActiveFilters(filters),
    [filters],
  )

  return {
    filters,
    setFilters,
    resetFilters,
    uniquePlatforms,
    uniqueBotStatuses,
    uniqueEmails,
    filteredEvents,
    hasActiveFilters: hasActive,
    activeFilterCount,
  }
}


