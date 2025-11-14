export const plannerEntriesQueryConfig = {
  staleTime: 0,
  gcTime: 10 * 60_000,
  refetchInterval: 30_000,
  refetchIntervalInBackground: true,
  structuralSharing: true,
} as const

export const plannerProjectsQueryConfig = {
  staleTime: Infinity,
} as const

