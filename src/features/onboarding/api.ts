"use server"

import { env } from "@/config/env"
import { authFetch } from "@/lib/authFetch"
import {
  OnboardingStateSchema,
  UpdateOnboardingPreferencesSchema,
} from "./schemas"
import type {
  IntegrationProvider,
  UpdateOnboardingPreferencesInput,
} from "./types"

const onboardingBaseUrl = () => {
  if (!env.backendUrl) {
    throw new Error("BACKEND_URL is not configured")
  }
  return `${env.backendUrl}/onboarding`
}

const integrationsBaseUrl = () => {
  if (!env.backendUrl) {
    throw new Error("BACKEND_URL is not configured")
  }
  return `${env.backendUrl}/integrations`
}

export async function fetchOnboardingState() {
  const response = await authFetch<unknown>(`${onboardingBaseUrl()}/state`)
  return OnboardingStateSchema.parse(response)
}

export async function updateOnboardingPreferences(
  input: UpdateOnboardingPreferencesInput,
) {
  const body = UpdateOnboardingPreferencesSchema.parse(input)
  const response = await authFetch<unknown>(
    `${onboardingBaseUrl()}/preferences`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  )
  return OnboardingStateSchema.parse(response)
}

const providerPathMap: Record<IntegrationProvider, string> = {
  google: "/google/oauth/url",
  linkedin: "/linkedin/oauth/url",
  facebook: "/facebook/oauth/url",
}

export async function requestIntegrationOAuthUrl(input: {
  provider: IntegrationProvider
  redirectPath?: string
}) {
  const path = providerPathMap[input.provider]
  const url = new URL(`${integrationsBaseUrl()}${path}`)
  if (input.redirectPath) {
    url.searchParams.set("redirect", input.redirectPath)
  }
  return authFetch<{ url: string }>(url.toString())
}

export async function disconnectConnectedAccount(accountId: string) {
  const url = `${integrationsBaseUrl()}/connected-accounts/${accountId}`
  await authFetch(url, { method: "DELETE" })
}
