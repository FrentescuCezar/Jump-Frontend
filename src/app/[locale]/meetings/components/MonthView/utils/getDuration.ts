/**
 * Calculates the duration in hours between start and end time
 */
export function getDuration(
  startTime: string,
  endTime: string | null | undefined,
): number {
  if (!endTime) return 1
  const start = new Date(startTime)
  const end = new Date(endTime)
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60) // hours
}

