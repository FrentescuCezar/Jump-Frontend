/**
 * Generates time slot labels for 24-hour format
 */
export function generateTimeSlots(): string[] {
  return Array.from({ length: 24 }, (_, i) => {
    if (i === 0) return "12 AM"
    if (i < 12) return `${i} AM`
    if (i === 12) return "12 PM"
    return `${i - 12} PM`
  })
}


