import { MONTH_VIEW_COLORS, MONTH_EMAIL_COLORS } from "../constants/monthView"
import { getEmailColorIndex } from "@/features/calendar/constants/eventColors"

/**
 * Gets the CSS classes for month view events based on email or calendar title
 * Uses left border style like v0, with ordered color assignment:
 * First email = purple, second = blue, third = yellow, then other v0 colors
 */
export function getEmailColor(
  email: string | null | undefined,
  calendarTitle: string | null | undefined,
): string {
  const identifier = email || calendarTitle || ""
  const lower = identifier.toLowerCase()

  // Check for keyword matches (like getEventColor does)
  if (lower.includes("personal")) {
    return MONTH_VIEW_COLORS.personal
  }
  if (lower.includes("work") || lower.includes("dev")) {
    return MONTH_VIEW_COLORS.work
  }
  if (lower.includes("design")) {
    return MONTH_VIEW_COLORS.design
  }
  if (lower.includes("sales")) {
    return MONTH_VIEW_COLORS.sales
  }
  if (lower.includes("marketing")) {
    return MONTH_VIEW_COLORS.marketing
  }
  if (lower.includes("devops")) {
    return MONTH_VIEW_COLORS.devops
  }

  // If no keyword match and we have an identifier, assign color based on order of first appearance
  // This uses the same tracking as week view for consistency
  if (identifier) {
    const colorIndex = getEmailColorIndex(identifier)
    return MONTH_EMAIL_COLORS[colorIndex % MONTH_EMAIL_COLORS.length]
  }

  // Default to purple (first color)
  return MONTH_EMAIL_COLORS[0]
}

