import type { CalendarEventApi } from "@/schemas/calendar/events"

export function formatMeetingTimeRange(
  event: CalendarEventApi,
  locale: string,
) {
  const start = new Date(event.startTime)
  const end = new Date(event.endTime)
  const timeZone = event.timezone ?? "UTC"

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone,
  })

  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  })

  return `${dateFormatter.format(start)} · ${timeFormatter.format(start)} — ${timeFormatter.format(end)}`
}
