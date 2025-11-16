import { env } from "@/config/env"
import { authFetch } from "@/lib/authFetch"
import {
  CalendarEventsDeltaResponseSchema,
  CalendarEventsResponseSchema,
} from "@/schemas/calendar/events"
import type { CalendarSyncSummary } from "./types"

const baseUrl = () => {
  if (!env.backendUrl) {
    throw new Error("BACKEND_URL is not configured")
  }
  return `${env.backendUrl}/calendar`
}

type CalendarWindow = "upcoming" | "past"

export async function fetchCalendarEvents(window: CalendarWindow = "upcoming") {
  const path =
    window === "past"
      ? "/events/past"
      : window === "upcoming"
        ? "/events/upcoming"
        : "/events"
  const response = await authFetch<unknown>(`${baseUrl()}${path}`)
  const parsed = CalendarEventsResponseSchema.parse(response)
  return {
    ...parsed,
    providerSyncedAt: parsed.providerSyncedAt ?? null,
  }
}

export async function fetchCalendarEventsDelta(updatedSince: string) {
  const url = new URL(`${baseUrl()}/events/delta-sync`)
  url.searchParams.set("updatedSince", updatedSince)

  const response = await authFetch<unknown>(url.toString())
  const parsed = CalendarEventsDeltaResponseSchema.parse(response)
  return {
    ...parsed,
    providerSyncedAt: parsed.providerSyncedAt ?? null,
  }
}

export async function syncCalendarNow(): Promise<CalendarSyncSummary> {
  return authFetch<CalendarSyncSummary>(`${baseUrl()}/sync-now`, {
    method: "POST",
  })
}
