import type { CalendarEvent } from "@/features/calendar/types"

/**
 * Extracts unique platform values from events
 */
export function getUniquePlatforms(events: CalendarEvent[]): string[] {
  const platforms = new Set<string>()
  events.forEach((event) => {
    if (event.meetingPlatform && event.meetingPlatform !== "UNKNOWN") {
      platforms.add(event.meetingPlatform)
    }
  })
  return Array.from(platforms)
}

/**
 * Extracts unique bot status values from events
 */
export function getUniqueBotStatuses(events: CalendarEvent[]): string[] {
  const statuses = new Set<string>()
  events.forEach((event) => {
    if (event.botStatus) {
      statuses.add(event.botStatus)
    }
  })
  return Array.from(statuses)
}

/**
 * Extracts unique email values from events
 */
export function getUniqueEmails(events: CalendarEvent[]): string[] {
  const emails = new Set<string>()
  events.forEach((event) => {
    if (event.creatorEmail) {
      emails.add(event.creatorEmail)
    }
  })
  return Array.from(emails).sort()
}


