/**
 * Month View Constants
 */

export const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const

export const BASE_CELL_HEIGHT = 140 // Increased to accommodate larger cards (py-1.5, text-sm)
export const HEIGHT_PER_EVENT = 36 // Increased to accommodate larger cards (py-1.5, text-sm, gap-2)

// Month view uses left border style, matching week view colors but with different opacity
export const MONTH_VIEW_COLORS = {
  personal: "bg-purple-600/20 border-l-4 border-purple-500",
  work: "bg-blue-500/20 border-l-4 border-blue-400",
  dev: "bg-blue-500/20 border-l-4 border-blue-400",
  design: "bg-pink-600/20 border-l-4 border-pink-500",
  sales: "bg-yellow-400/20 border-l-4 border-yellow-400",
  marketing: "bg-orange-600/20 border-l-4 border-orange-500",
  devops: "bg-cyan-600/20 border-l-4 border-cyan-500",
  default: "bg-purple-600/20 border-l-4 border-purple-500",
} as const

// Color palette for email-based assignment in month view
// Order: purple (1st), blue (2nd), yellow (3rd), then other v0 colors
// Uses left border style like month view
export const MONTH_EMAIL_COLORS = [
  "bg-purple-600/20 border-l-4 border-purple-500", // 1st: purple
  "bg-blue-500/20 border-l-4 border-blue-400", // 2nd: blue
  "bg-yellow-400/20 border-l-4 border-yellow-400", // 3rd: yellow
  "bg-pink-600/20 border-l-4 border-pink-500", // 4th: pink
  "bg-cyan-600/20 border-l-4 border-cyan-500", // 5th: cyan
  "bg-emerald-600/20 border-l-4 border-emerald-500", // 6th: emerald
  "bg-orange-600/20 border-l-4 border-orange-500", // 7th: orange
  "bg-indigo-600/20 border-l-4 border-indigo-500", // 8th: indigo
] as const

export const BOT_STATUS_COLORS = {
  COMPLETED: "#10b981",
  CANCELED: "#ef4444",
  UPCOMING: "#3b82f6",
  default: "#6b7280",
} as const
