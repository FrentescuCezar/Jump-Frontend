/**
 * Formats a decimal hour (e.g., 14.5) to a readable time string (e.g., "2:30 PM")
 */
export function formatHour(hour: number): string {
  const h = Math.floor(hour)
  const m = Math.floor((hour % 1) * 60)
  const period = h >= 12 ? "PM" : "AM"
  const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${displayHour}:${m.toString().padStart(2, "0")} ${period}`
}

