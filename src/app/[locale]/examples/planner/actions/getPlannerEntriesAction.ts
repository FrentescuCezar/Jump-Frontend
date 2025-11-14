"use server"

import { fetchPlannerEntries } from "@/features/examples/planner/api"
import {
  PlannerEntriesResponse,
  PlannerRangeInput,
  PlannerRangeSchema,
} from "@/schemas/examples/planner"

export async function getPlannerEntriesAction(
  input: PlannerRangeInput,
): Promise<PlannerEntriesResponse> {
  const parsed = PlannerRangeSchema.parse(input)
  return fetchPlannerEntries(parsed)
}




