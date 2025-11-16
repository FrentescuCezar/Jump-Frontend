import { fetchConnectedAccounts } from "../api"
import type { ConnectedAccount } from "../types"

export async function connectedAccountsQueryFn(): Promise<ConnectedAccount[]> {
  return fetchConnectedAccounts()
}

