import { env } from "@/config/env"
import { authFetch } from "@/lib/authFetch"
import {
  PlannerCreateResponseSchema,
  PlannerEntriesResponseSchema,
  PlannerDeltaSyncResponseSchema,
  PlannerDeltaSyncInput,
  PlannerEntryInput,
  PlannerProjectsResponseSchema,
  PlannerRangeInput,
} from "@/schemas/examples/planner"

const baseUrl = () => {
  if (!env.backendUrl) {
    throw new Error("BACKEND_URL is not configured")
  }
  return `${env.backendUrl}/examples/planner`
}

export async function fetchPlannerEntries(input: PlannerRangeInput) {
  const response = await authFetch<unknown>(`${baseUrl()}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  return PlannerEntriesResponseSchema.parse(response)
}

export async function fetchPlannerProjects() {
  const response = await authFetch<unknown>(`${baseUrl()}/projects`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })

  return PlannerProjectsResponseSchema.parse(response)
}

export async function createPlannerEntry(input: PlannerEntryInput) {
  const response = await authFetch<unknown>(`${baseUrl()}/entries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  return PlannerCreateResponseSchema.parse(response)
}

export async function fetchPlannerDeltaSync(input: PlannerDeltaSyncInput) {
  const response = await authFetch<unknown>(`${baseUrl()}/delta-sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  return PlannerDeltaSyncResponseSchema.parse(response)
}

