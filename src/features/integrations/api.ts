import { env } from "@/config/env"
import { authFetch } from "@/lib/authFetch"

export type ConnectedAccount = {
  id: string
  provider: "GOOGLE_CALENDAR" | "LINKEDIN" | "FACEBOOK"
  label: string | null
  scopes: string[]
  metadata: Record<string, unknown> | null
  expiresAt: string | null
  linkedAt: string
  lastSyncedAt: string | null
}

export async function fetchConnectedAccounts() {
  if (!env.backendUrl) {
    throw new Error("BACKEND_URL is not configured")
  }
  return authFetch<ConnectedAccount[]>(
    `${env.backendUrl}/integrations/connected-accounts`,
  )
}

