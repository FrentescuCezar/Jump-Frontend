"use client"

import { useOptimistic, useTransition } from "react"
import Link from "next/link"
import type { QueryKey } from "@tanstack/react-query"
import { useQueryClient } from "@tanstack/react-query"
import { MapPin, Bell, Repeat, User } from "lucide-react"
import { CalendarEvent } from "../types"
import { toggleNotetakerAction } from "../actions/toggleNotetakerAction"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type CalendarEventsListProps = {
  events: CalendarEvent[]
  locale: string
  queryKey: QueryKey
  showNotetakerToggle?: boolean
  showDetailLink?: boolean
}

export function CalendarEventsList({
  events,
  locale,
  queryKey,
  showNotetakerToggle = true,
  showDetailLink = false,
}: CalendarEventsListProps) {
  const queryClient = useQueryClient()
  const [optimisticEvents, toggle] = useOptimistic(
    events,
    (state, input: TogglePayload) =>
      state.map((event) =>
        event.id === input.eventId
          ? { ...event, notetakerEnabled: input.enabled }
          : event,
      ),
  )
  const [isPending, startTransition] = useTransition()

  const handleToggle = (eventId: string, enabled: boolean) => {
    startTransition(async () => {
      toggle({ eventId, enabled })
      try {
        await toggleNotetakerAction({ eventId, enabled, locale })
        await queryClient.invalidateQueries({ queryKey })
      } catch (error) {
        console.error("Failed to toggle notetaker", error)
        toggle({ eventId, enabled: !enabled })
      }
    })
  }

  if (!optimisticEvents.length) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">
          No events detected in the next few weeks. Connect a calendar or adjust
          your filters to get started.
        </p>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {optimisticEvents.map((event) => (
        <Card key={event.id} className="border-border/60 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-xl">
                {event.title ?? "Untitled Meeting"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {event.rangeLabel}
              </p>
            </div>
            <Badge variant="outline" className="shrink-0">
              {formatPlatform(event.meetingPlatform)}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary">
                {event.accountLabel ?? event.provider}
              </Badge>
              {event.botStatus && (
                <Badge variant="outline" className="uppercase tracking-wide">
                  Bot: {event.botStatus.toLowerCase()}
                </Badge>
              )}
              {event.notetakerEnabled && (
                <Badge variant="outline" className="text-xs uppercase">
                  Notetaker on
                </Badge>
              )}
            </div>

            {(event.location ||
              event.reminders ||
              event.recurrence ||
              event.creatorDisplayName) && (
              <div className="space-y-2 text-sm">
                {event.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>{event.location}</span>
                  </div>
                )}
                {event.reminders && formatReminders(event.reminders) && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Bell className="h-4 w-4 shrink-0" />
                    <span>{formatReminders(event.reminders)}</span>
                  </div>
                )}
                {event.recurrence && event.recurrence.length > 0 && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Repeat className="h-4 w-4 shrink-0" />
                    <span>Recurring event</span>
                  </div>
                )}
                {event.creatorDisplayName && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4 shrink-0" />
                    <span>Created by {event.creatorDisplayName}</span>
                  </div>
                )}
              </div>
            )}

            {showNotetakerToggle && (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Recall notetaker</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically joins{" "}
                    {event.notetakerEnabled ? "this" : "the next"} occurrence.
                  </p>
                </div>
                <Switch
                  checked={event.notetakerEnabled}
                  onCheckedChange={(checked) => handleToggle(event.id, checked)}
                />
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {event.meetingUrl && (
                <Button asChild variant="outline" size="sm">
                  <Link
                    href={event.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Join call
                  </Link>
                </Button>
              )}
              {showDetailLink && (
                <Button asChild variant="secondary" size="sm">
                  <Link href={`/${locale}/meetings/${event.id}`}>
                    View details
                  </Link>
                </Button>
              )}
              <Badge
                variant={event.status === "COMPLETED" ? "outline" : "default"}
              >
                {event.status.toLowerCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

type TogglePayload = {
  eventId: string
  enabled: boolean
}

function formatPlatform(platform: string) {
  switch (platform) {
    case "GOOGLE_MEET":
      return "Google Meet"
    case "MICROSOFT_TEAMS":
      return "Microsoft Teams"
    case "ZOOM":
      return "Zoom"
    default:
      return "Virtual meeting"
  }
}

function formatReminders(
  reminders: Record<string, unknown> | null | undefined,
): string | null {
  if (!reminders) return null

  const overrides = reminders.overrides as
    | Array<{ method: string; minutes: number }>
    | undefined

  if (reminders.useDefault) {
    return "Default reminders"
  }

  if (overrides && overrides.length > 0) {
    const formatted = overrides
      .map((override) => {
        if (override.minutes === 0) return "At time of event"
        if (override.minutes < 60) return `${override.minutes} min before`
        const hours = Math.floor(override.minutes / 60)
        const mins = override.minutes % 60
        if (mins === 0) return `${hours} hour${hours > 1 ? "s" : ""} before`
        return `${hours}h ${mins}m before`
      })
      .join(", ")
    return formatted
  }

  return null
}
