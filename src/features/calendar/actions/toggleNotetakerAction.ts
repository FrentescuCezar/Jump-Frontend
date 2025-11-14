"use server"

import { env } from "@/config/env"
import { authFetch } from "@/lib/authFetch"

export async function toggleNotetakerAction(input: {
  eventId: string
  enabled: boolean
  locale: string
}) {
  if (!env.backendUrl) {
    throw new Error("BACKEND_URL is not configured")
  }

  await authFetch(
    `${env.backendUrl}/calendar/events/${input.eventId}/notetaker`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: input.enabled }),
    },
  )
}
