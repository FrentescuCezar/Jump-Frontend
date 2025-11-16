export const GOOGLE_ACCOUNT_COLORS = [
  "#8B5CF6",
  "#06B6D4",
  "#EC4899",
  "#F59E0B",
  "#10B981",
]

export const getGoogleAccountColor = (index: number) =>
  GOOGLE_ACCOUNT_COLORS[index % GOOGLE_ACCOUNT_COLORS.length]
