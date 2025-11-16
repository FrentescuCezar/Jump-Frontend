/**
 * Bot Status Color Constants
 */

export const BOT_STATUS_COLORS = {
  DONE: "#10b981", // green
  COMPLETED: "#10b981", // green
  CANCELLED: "#ef4444", // red
  CANCELED: "#ef4444", // red
  UPCOMING: "#3b82f6", // blue
  SCHEDULED: "#3b82f6", // blue
  JOINING: "#3b82f6", // blue
  IN_CALL: "#3b82f6", // blue
  DEFAULT: "#6b7280", // gray
} as const

export const getBotStatusColor = (status: string): string => {
  if (status === "DONE" || status === "COMPLETED") return BOT_STATUS_COLORS.DONE
  if (status === "CANCELLED" || status === "CANCELED")
    return BOT_STATUS_COLORS.CANCELLED
  if (
    status === "UPCOMING" ||
    status === "SCHEDULED" ||
    status === "JOINING" ||
    status === "IN_CALL"
  )
    return BOT_STATUS_COLORS.UPCOMING
  return BOT_STATUS_COLORS.DEFAULT
}


