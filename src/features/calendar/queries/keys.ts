import type { CalendarEventsQueryInput } from "../types"

export const calendarEventsKey = (input: CalendarEventsQueryInput) => [
  "calendar-events",
  input.userId,
  input.locale,
  input.window ?? "upcoming",
]


