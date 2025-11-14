"use server"

import { fetchPlannerProjects } from "@/features/examples/planner/api"
import { PlannerProjectsResponse } from "@/schemas/examples/planner"

export async function getPlannerProjectsAction(): Promise<PlannerProjectsResponse> {
  return fetchPlannerProjects()
}




