/**
 * Formats a time string to a readable format (e.g., "9:30AM")
 */
export function formatTime(startTime: string): string {
  const date = new Date(startTime)
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const period = hours < 12 ? "AM" : "PM"
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  return `${displayHours}:${minutes.toString().padStart(2, "0")}${period}`
}


