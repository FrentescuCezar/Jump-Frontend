import { useMemo } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { plannerEntriesQuery } from "../queries"
import type { PlannerRangeInput, PlannerEntry } from "@/schemas/examples/planner"
import type { DayBucket } from "@/app/[locale]/examples/planner/components/PlannerTimeline"
import { groupEntriesByDate } from "../utils/groupEntries"

export function usePlannerEntries(range: PlannerRangeInput) {
  const queryClient = useQueryClient()
  const query = useQuery({
    ...plannerEntriesQuery(range, queryClient),
    enabled: !!range.userId && !!range.start && !!range.end,
  })

  const groupedDays = useMemo<DayBucket[]>(() => {
    if (!query.data?.entries) return []
    return groupEntriesByDate(query.data.entries)
  }, [query.data?.entries])

  const getEntriesForDate = (date: string): PlannerEntry[] => {
    const entries = query.data?.entries ?? []
    return entries.filter((entry) => {
      const entryDate = entry.date.slice(0, 10)
      return entryDate === date
    })
  }

  return {
    query,
    groupedDays,
    getEntriesForDate,
  }
}


