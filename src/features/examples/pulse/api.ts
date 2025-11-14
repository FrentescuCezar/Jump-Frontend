import { cache } from "react"
import { env } from "@/config/env"
import { PulseResponseSchema, PulseResponse } from "@/schemas/examples/pulse"

const endpoint = () => {
  if (!env.backendUrl) {
    throw new Error("BACKEND_URL is not configured")
  }
  return `${env.backendUrl}/examples/pulse`
}

export const getPulseInsights = cache(async (): Promise<PulseResponse> => {
  const response = await fetch(endpoint(), {
    next: { revalidate: 60, tags: ["examples:pulse"] },
    headers: { "Content-Type": "application/json" },
  })

  if (!response.ok) {
    throw new Error("Failed to load pulse insights")
  }

  const data = await response.json()
  return PulseResponseSchema.parse(data)
})





