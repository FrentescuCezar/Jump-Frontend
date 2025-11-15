import { env } from "@/config/env"
import { authFetch } from "@/lib/authFetch"
import {
  CalendarEventsDeltaResponseSchema,
  CalendarEventsResponseSchema,
} from "@/schemas/calendar/events"

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
  return CalendarEventsResponseSchema.parse(response)
}

export async function fetchCalendarEventsDelta(updatedSince: string) {
  const url = new URL(`${baseUrl()}/events/delta-sync`)
  url.searchParams.set("updatedSince", updatedSince)

  const response = await authFetch<unknown>(url.toString())
  return CalendarEventsDeltaResponseSchema.parse(response)
}
