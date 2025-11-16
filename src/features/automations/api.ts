import { env } from "@/config/env"
import { authFetch } from "@/lib/authFetch"
import {
  AutomationListSchema,
  AutomationSchema,
} from "@/schemas/automations/automation"

const automationsBaseUrl = () => {
  if (!env.backendUrl) {
    throw new Error("BACKEND_URL is not configured")
  }
  return `${env.backendUrl}/automations`
}

export async function fetchAutomations() {
  const response = await authFetch<unknown>(automationsBaseUrl())
  return AutomationListSchema.parse(response)
}

export async function saveAutomation(input: {
  id?: string
  name: string
  channel: string
  promptTemplate: string
  isEnabled: boolean
}) {
  const hasId = Boolean(input.id)
  const url = hasId
    ? `${automationsBaseUrl()}/${input.id}`
    : automationsBaseUrl()

  const response = await authFetch<unknown>(url, {
    method: hasId ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: input.name,
      channel: input.channel,
      promptTemplate: input.promptTemplate,
      isEnabled: input.isEnabled,
    }),
  })

  return AutomationSchema.parse(response)
}

