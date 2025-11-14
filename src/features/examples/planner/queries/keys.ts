import type { PlannerRangeInput } from "@/schemas/examples/planner"

export const plannerEntriesKey = (input: PlannerRangeInput) =>
  ["planner", "entries", input.userId, input.start, input.end] as const

export const plannerProjectsKey = ["planner", "catalog"] as const


