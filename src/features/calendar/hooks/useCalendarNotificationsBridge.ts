"use client"

import { useEffect, useRef } from "react"
import { useNotificationStore } from "@/features/examples/chat/store"
import { formatMeetingTimeRange } from "@/features/calendar/utils/formatMeetingTimeRange"
import { CALENDAR_NOTIFICATION_POLL_INTERVAL_MS } from "@/features/calendar/constants"
import type { AppNotification } from "@/features/notifications/types"
import type {
  CalendarEvent,
  CalendarEventsDeltaResult,
  CalendarEventsQueryResult,
  RecallBotStatus,
} from "@/features/calendar/types"

type Params = {
  userId: string
  locale: string
}

export function useCalendarNotificationsBridge({ userId, locale }: Params) {
  const upsertNotification = useNotificationStore(
    (state) => state.upsertNotification,
  )
  const eventSnapshotRef = useRef<
    Map<
      string,
      {
        botStatus: RecallBotStatus | null
        status: string | null
        meetingUrl: string | null
      }
    >
  >(new Map())
  const lastTimestampRef = useRef<string | null>(null)
  const pollInFlightRef = useRef<Promise<void> | null>(null)

  useEffect(() => {
    if (!userId) {
      return
    }

    let cancelled = false

    const bootstrap = async () => {
      try {
        const initial = await fetchInitialEvents()
        if (cancelled) return
        lastTimestampRef.current = initial.serverTimestamp
        initial.events.forEach((event) => {
          eventSnapshotRef.current.set(event.id, {
            botStatus: event.botStatus ?? null,
            status: event.status ?? null,
            meetingUrl: event.meetingUrl ?? null,
          })
        })
      } catch (error) {
        // swallow bootstrap errors; we'll retry on next poll
      }
    }

    const ensureBootstrap = async () => {
      if (!lastTimestampRef.current) {
        await bootstrap()
      }
    }

    const pollDelta = async () => {
      if (pollInFlightRef.current) {
        return
      }
      const promise = (async () => {
        try {
          await ensureBootstrap()
          if (!lastTimestampRef.current || cancelled) {
            return
          }
          const delta = await fetchDelta(lastTimestampRef.current)
          if (cancelled) {
            return
          }
          lastTimestampRef.current = delta.serverTimestamp

          delta.deletedIds.forEach((id) => {
            eventSnapshotRef.current.delete(id)
          })

          delta.events.forEach((event) => {
            const previous = eventSnapshotRef.current.get(event.id)
            const isNewEvent = !previous
            if (isNewEvent) {
              const notification = createCalendarNotification(
                event,
                locale,
                "new-event",
              )
              upsertNotification(notification)
            } else {
              const wasBotDone = previous.botStatus === "DONE"
              const isBotDone = event.botStatus === "DONE"
              if (!wasBotDone && isBotDone) {
                const notification = createCalendarNotification(
                  event,
                  locale,
                  "bot-completed",
                )
                upsertNotification(notification)
              }

              const previousMeetingUrl = previous.meetingUrl ?? null
              const currentMeetingUrl = event.meetingUrl ?? null
              if (previousMeetingUrl !== currentMeetingUrl) {
                const action: NotificationChangeAction =
                  currentMeetingUrl && !previousMeetingUrl
                    ? "added"
                    : !currentMeetingUrl && previousMeetingUrl
                      ? "removed"
                      : "updated"
                const meetingLinkChange: NotificationChange = {
                  field: "meetingUrl",
                  label: "Meeting link",
                  previous: previousMeetingUrl,
                  current: currentMeetingUrl,
                  action,
                }
                const notification = createCalendarNotification(
                  event,
                  locale,
                  "meeting-link-updated",
                  { change: meetingLinkChange },
                )
                upsertNotification(notification)
              }
            }

            eventSnapshotRef.current.set(event.id, {
              botStatus: event.botStatus ?? null,
              status: event.status ?? null,
              meetingUrl: event.meetingUrl ?? null,
            })
          })
        } catch (error) {
          // optional: console.warn("Calendar notification polling failed", error)
        } finally {
          pollInFlightRef.current = null
        }
      })()
      pollInFlightRef.current = promise
    }

    void bootstrap()
    const interval = setInterval(() => {
      void pollDelta()
    }, CALENDAR_NOTIFICATION_POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(interval)
      pollInFlightRef.current = null
      eventSnapshotRef.current.clear()
      lastTimestampRef.current = null
    }
  }, [locale, upsertNotification, userId])
}

function createCalendarNotification(
  event: CalendarEvent,
  locale: string,
  variant: "new-event" | "bot-completed" | "meeting-link-updated",
  options?: { change?: NotificationChange },
): AppNotification {
  const range = formatMeetingTimeRange(event, locale)
  const accountLabel = event.accountLabel ?? event.provider

  if (variant === "bot-completed") {
    return {
      id: `calendar-${event.id}-bot-completed`,
      title: `Bot completed: ${event.title ?? "Meeting"}`,
      body: `Recall summary ready for ${range}`,
      createdAt: new Date().toISOString(),
      readAt: null,
      type: "calendar:bot-completed",
      source: "calendar",
      roomSlug: null,
      messageId: null,
      metadata: {
        eventId: event.id,
        meetingId: event.id,
        provider: event.provider,
        accountLabel: event.accountLabel,
        startTime: event.startTime,
        endTime: event.endTime,
        botStatus: event.botStatus,
        eventAction: "bot-completed",
      },
    }
  }

  if (variant === "meeting-link-updated" && options?.change) {
    const summary = describeChange(options.change)
    return {
      id: `calendar-${event.id}-meeting-link-${Date.now()}`,
      title: `Meeting link updated: ${event.title ?? "Meeting"}`,
      body: summary,
      createdAt: new Date().toISOString(),
      readAt: null,
      type: "calendar:meeting-link",
      source: "calendar",
      roomSlug: null,
      messageId: null,
      metadata: {
        eventId: event.id,
        meetingId: event.id,
        provider: event.provider,
        accountLabel: event.accountLabel,
        startTime: event.startTime,
        endTime: event.endTime,
        eventAction: "updated",
        changes: [options.change],
      },
    }
  }

  const highlights = buildCreationHighlights(event, locale)
  const creationSummary = buildCreationSummary(range, accountLabel, highlights)

  return {
    id: `calendar-${event.id}-${event.startTime}`,
    title: event.title ?? "New calendar activity",
    body: creationSummary,
    createdAt: new Date().toISOString(),
    readAt: null,
    type: "calendar:new",
    source: "calendar",
    roomSlug: null,
    messageId: null,
    metadata: {
      eventId: event.id,
      meetingId: event.id,
      provider: event.provider,
      accountLabel: event.accountLabel,
      startTime: event.startTime,
      endTime: event.endTime,
      eventAction: "created",
      changes: highlights,
    },
  }
}

async function fetchInitialEvents(): Promise<CalendarEventsQueryResult> {
  const res = await fetch("/api/calendar/events/upcoming", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  })
  if (!res.ok) {
    throw new Error("Failed to load calendar events")
  }
  return (await res.json()) as CalendarEventsQueryResult
}

async function fetchDelta(
  updatedSince: string,
): Promise<CalendarEventsDeltaResult> {
  const url = new URL("/api/calendar/events/delta", window.location.origin)
  url.searchParams.set("updatedSince", updatedSince)

  const res = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  })
  if (!res.ok) {
    throw new Error("Failed to load calendar delta")
  }
  return (await res.json()) as CalendarEventsDeltaResult
}

type NotificationChangeAction = "added" | "removed" | "updated"

type NotificationChange = {
  field: string
  label: string
  previous: string | null
  current: string | null
  action: NotificationChangeAction
}

function buildCreationHighlights(
  event: CalendarEvent,
  locale: string,
): NotificationChange[] {
  const highlights: NotificationChange[] = [
    {
      field: "startTime",
      label: "Start time",
      previous: null,
      current: formatDateTime(event.startTime, event.timezone, locale),
      action: "added",
    },
  ]

  if (event.meetingUrl) {
    highlights.push({
      field: "meetingUrl",
      label: "Meeting link",
      previous: null,
      current: event.meetingUrl,
      action: "added",
    })
  }

  if (event.location) {
    highlights.push({
      field: "location",
      label: "Location",
      previous: null,
      current: event.location,
      action: "added",
    })
  }

  if (event.meetingPlatform && event.meetingPlatform !== "UNKNOWN") {
    highlights.push({
      field: "meetingPlatform",
      label: "Platform",
      previous: null,
      current: formatPlatform(event.meetingPlatform),
      action: "added",
    })
  }

  return highlights
}

function buildCreationSummary(
  range: string,
  accountLabel: string | null | undefined,
  highlights: NotificationChange[],
) {
  const detailSummary = highlights
    .filter((change) => change.field !== "startTime")
    .slice(0, 2)
    .map((change) => describeChange(change))

  const segments = [
    "Meeting added",
    range,
    accountLabel ?? "Calendar",
    ...detailSummary,
  ].filter(Boolean)

  const extra =
    highlights.length > detailSummary.length + 1
      ? ` (+${highlights.length - (detailSummary.length + 1)} more)`
      : ""

  return `${segments.join(" • ")}${extra}`
}

function describeChange(change: NotificationChange) {
  const indicator = describeAction(change.action)
  const value =
    change.action === "removed"
      ? change.previous ?? "Removed"
      : change.current ?? "Updated"
  return `${change.label} ${indicator}${value ? `: ${value}` : ""}`
}

function describeAction(action: NotificationChangeAction) {
  switch (action) {
    case "added":
      return "added"
    case "removed":
      return "removed"
    case "updated":
    default:
      return "updated"
  }
}

function formatPlatform(platform: CalendarEvent["meetingPlatform"]) {
  switch (platform) {
    case "ZOOM":
      return "Zoom"
    case "GOOGLE_MEET":
      return "Google Meet"
    case "MICROSOFT_TEAMS":
      return "Microsoft Teams"
    case "UNKNOWN":
    default:
      return "Unknown"
  }
}

function formatDateTime(
  value: string,
  timeZone: string | null | undefined,
  locale: string,
) {
  try {
    return new Intl.DateTimeFormat(locale ?? "en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: timeZone ?? undefined,
      timeZoneName: "short",
    }).format(new Date(value))
  } catch {
    return new Date(value).toLocaleString()
  }
}
