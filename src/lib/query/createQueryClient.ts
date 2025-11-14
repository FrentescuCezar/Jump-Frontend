import { QueryClient } from "@tanstack/react-query"

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false, // Disabled to prevent refetch on tab switch
        refetchOnReconnect: true, // Refetch when network reconnects
        staleTime: 60_000, // Data is fresh for 60 seconds
        gcTime: 10 * 60_000, // Cache kept for 10 minutes
        retry: 1,
      },
      mutations: {
        retry: 1,
      },
    },
  })
}


