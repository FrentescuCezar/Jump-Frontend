"use server"

import { fetchPlannerDeltaSync } from "@/features/examples/planner/api"
import {
  PlannerDeltaSyncInput,
  PlannerDeltaSyncSchema,
} from "@/schemas/examples/planner"

export async function getPlannerEntriesDeltaSyncAction(
  input: PlannerDeltaSyncInput,
) {
  const parsed = PlannerDeltaSyncSchema.parse(input)
  return fetchPlannerDeltaSync(parsed)
}


