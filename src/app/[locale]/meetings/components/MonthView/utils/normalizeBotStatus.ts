/**
 * Normalizes bot status to a standard format
 */
export function normalizeBotStatus(
  status: string | null | undefined,
): "COMPLETED" | "CANCELED" | "UPCOMING" | undefined {
  if (!status) return undefined

  const normalized = status.toUpperCase()
  if (normalized === "DONE" || normalized === "COMPLETED") {
    return "COMPLETED"
  }
  if (normalized === "CANCELLED" || normalized === "CANCELED") {
    return "CANCELED"
  }
  if (
    normalized === "SCHEDULED" ||
    normalized === "JOINING" ||
    normalized === "IN_CALL" ||
    normalized === "UPCOMING"
  ) {
    return "UPCOMING"
  }

  return undefined
}

