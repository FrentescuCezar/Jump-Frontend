import type {
  PlannerEntriesResponse,
  PlannerDeltaSyncResponse,
} from "@/schemas/examples/planner"

export function mergeDeltaEntries(
  existing: PlannerEntriesResponse,
  delta: PlannerDeltaSyncResponse,
): PlannerEntriesResponse {
  const entriesMap = new Map(existing.entries.map((e) => [e.id, e]))

  for (const entry of delta.entries) {
    entriesMap.set(entry.id, entry)
  }

  for (const deletedId of delta.deletedIds) {
    entriesMap.delete(deletedId)
  }

  const mergedEntries = Array.from(entriesMap.values()).sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date)
    if (dateCompare !== 0) return dateCompare
    return a.createdAt.localeCompare(b.createdAt)
  })

  const daysWithEntries = new Set(mergedEntries.map((e) => e.date.slice(0, 10)))
    .size
  const totalHours = mergedEntries.reduce((sum, e) => sum + e.hours, 0)

  return {
    range: existing.range,
    entries: mergedEntries,
    totals: {
      totalHours: Number(totalHours.toFixed(1)),
      daysWithEntries,
    },
    serverTimestamp: delta.serverTimestamp,
  }
}
