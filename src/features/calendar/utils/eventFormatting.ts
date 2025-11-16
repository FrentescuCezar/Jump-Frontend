/**
 * Formats a time range from start and end times
 */
export function formatTimeRange(startTime: string, endTime: string | null | undefined): string {
  const start = new Date(startTime)
  const end = endTime ? new Date(endTime) : new Date(start.getTime() + 60 * 60 * 1000)
  
  const formatSingleTime = (date: Date) => {
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const period = hours < 12 ? "AM" : "PM"
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    return `${displayHours}:${minutes.toString().padStart(2, "0")}${period}`
  }
  
  return `${formatSingleTime(start)} - ${formatSingleTime(end)}`
}

