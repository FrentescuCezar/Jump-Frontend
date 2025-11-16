import type { QueryClient } from "@tanstack/react-query"
import { onboardingStateQueryFn } from "./onboardingStateQueryFn"
import { onboardingStateKey } from "./keys"
import { onboardingStateQueryConfig } from "./config"

export { onboardingStateKey } from "./keys"

export const onboardingStateQuery = (
  input: { locale: string },
  _queryClient?: QueryClient,
) => ({
  queryKey: onboardingStateKey(input),
  queryFn: () => onboardingStateQueryFn(input),
  ...onboardingStateQueryConfig,
})

