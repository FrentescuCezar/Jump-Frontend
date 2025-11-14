import type { PlannerEntry } from "@/schemas/examples/planner"
import type { DayBucket } from "@/app/[locale]/examples/planner/components/PlannerTimeline"

export function groupEntriesByDate(entries: PlannerEntry[]): DayBucket[] {
  if (entries.length === 0) return []

  const buckets = new Map<string, PlannerEntry[]>()
  for (const entry of entries) {
    // Ensure date is in YYYY-MM-DD format
    const dateKey = entry.date.slice(0, 10)
    if (!buckets.has(dateKey)) {
      buckets.set(dateKey, [])
    }
    buckets.get(dateKey)!.push(entry)
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, dayEntries]) => ({
      date,
      entries: dayEntries,
      totalHours: Number(
        dayEntries.reduce((sum, item) => sum + item.hours, 0).toFixed(1),
      ),
    }))
}


