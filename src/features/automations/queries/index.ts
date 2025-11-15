import type { QueryClient } from "@tanstack/react-query"
import type { AutomationsQueryInput } from "../types"
import { automationsQueryFn } from "./automationsQueryFn"
import { automationsKey } from "./keys"
import { automationsQueryConfig } from "./config"

export { automationsKey } from "./keys"

export const automationsQuery = (
  input: AutomationsQueryInput,
  queryClient?: QueryClient,
) => ({
  queryKey: automationsKey(input),
  queryFn: () => automationsQueryFn(input, queryClient),
  ...automationsQueryConfig,
})

