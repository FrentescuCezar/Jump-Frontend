/**
 * Normalizes meeting platform to a standard format
 */
export function normalizeMeetingType(
  platform: string | null | undefined,
): "zoom" | "teams" | "meet" | undefined {
  if (!platform) return undefined

  const normalized = platform.toUpperCase()
  if (normalized === "ZOOM") return "zoom"
  if (normalized === "MICROSOFT_TEAMS") return "teams"
  if (normalized === "GOOGLE_MEET") return "meet"

  return undefined
}


