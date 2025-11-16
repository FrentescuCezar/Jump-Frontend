import { EVENT_COLORS, EMAIL_COLORS, getEmailColorIndex } from "../constants/eventColors"

/**
 * Gets the CSS classes for an event based on email or calendar title.
 * Deterministically assigns a color per email/calendar so it stays stable across refreshes.
 */
export function getEventColor(
  email: string | null | undefined,
  calendarTitle: string | null | undefined
): string {
  const identifier = email || calendarTitle || ""
  const lower = identifier.toLowerCase()
  
  // Check for keyword matches first
  if (lower.includes("personal")) {
    return EVENT_COLORS.personal
  }
  if (lower.includes("work") || lower.includes("dev")) {
    return EVENT_COLORS.work
  }
  if (lower.includes("design")) {
    return EVENT_COLORS.design
  }
  if (lower.includes("sales")) {
    return EVENT_COLORS.sales
  }
  if (lower.includes("marketing")) {
    return EVENT_COLORS.marketing
  }
  if (lower.includes("devops")) {
    return EVENT_COLORS.devops
  }
  
  // If no keyword match and we have an identifier, assign color based on order of first appearance
  if (identifier) {
    const colorIndex = getEmailColorIndex(identifier)
    return EMAIL_COLORS[colorIndex % EMAIL_COLORS.length]
  }
  
  // Default to purple (first color)
  return EMAIL_COLORS[0]
}

