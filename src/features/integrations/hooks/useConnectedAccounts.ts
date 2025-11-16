"use client"

import { useQuery } from "@tanstack/react-query"
import { connectedAccountsQuery } from "../queries"

type Options = {
  enabled?: boolean
}

export function useConnectedAccounts(options: Options = {}) {
  const { enabled = true } = options
  const query = useQuery({
    ...connectedAccountsQuery(),
    enabled,
  })

  return {
    query,
    connectedAccounts: query.data ?? [],
  }
}

