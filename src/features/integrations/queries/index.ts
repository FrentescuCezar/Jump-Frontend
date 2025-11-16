import type { QueryClient } from "@tanstack/react-query"
import { connectedAccountsQueryFn } from "./connectedAccountsQueryFn"
import { connectedAccountsKey } from "./keys"
import { connectedAccountsQueryConfig } from "./config"

export { connectedAccountsKey } from "./keys"

export const connectedAccountsQuery = (queryClient?: QueryClient) => ({
  queryKey: connectedAccountsKey(),
  queryFn: connectedAccountsQueryFn,
  ...connectedAccountsQueryConfig,
})

