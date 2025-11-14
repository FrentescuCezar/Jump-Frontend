import type { ConnectedProvider } from "@/features/calendar/types"

export type ConnectedAccount = {
  id: string
  provider: ConnectedProvider
  label?: string | null
  scopes: string[]
  metadata?: Record<string, unknown> | null
  expiresAt?: string | null
  linkedAt: string
  lastSyncedAt?: string | null
}
