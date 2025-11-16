"use server"

import { requestIntegrationOAuthUrl } from "@/features/onboarding/api"
import type { IntegrationProvider } from "@/features/onboarding/types"

type GetIntegrationOAuthUrlActionInput = {
  provider: IntegrationProvider
  redirectPath?: string
  locale: string
}

export async function getIntegrationOAuthUrlAction(
  input: GetIntegrationOAuthUrlActionInput,
) {
  const { provider, redirectPath } = input
  return requestIntegrationOAuthUrl({ provider, redirectPath })
}

