export const calendarEventsQueryConfig = {
  staleTime: 0,
  gcTime: 10 * 60_000,
  refetchInterval: 15_000,
  refetchIntervalInBackground: true,
  structuralSharing: true,
} as const
