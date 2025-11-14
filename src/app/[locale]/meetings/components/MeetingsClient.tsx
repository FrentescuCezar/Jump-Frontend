"use client"

import { useMemo, useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { RefreshCcw } from "lucide-react"
import { CalendarEventsList } from "@/features/calendar/components/CalendarEventsList"
import { calendarEventsKey } from "@/features/calendar/queries"
import { useCalendarEvents } from "@/features/calendar/hooks/useCalendarEvents"
import { useMeetingsStore } from "@/features/calendar/store"

type MeetingsClientProps = {
  userId: string
  locale: string
}

export default function MeetingsClient({
  userId,
  locale,
}: MeetingsClientProps) {
  const { query, events } = useCalendarEvents({ userId, locale })
  const showNotetakerOnly = useMeetingsStore((state) => state.showNotetakerOnly)
  const setShowNotetakerOnly = useMeetingsStore(
    (state) => state.setShowNotetakerOnly,
  )
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const filteredEvents = useMemo(() => {
    if (!showNotetakerOnly) {
      return events
    }
    return events.filter((event) => event.notetakerEnabled)
  }, [events, showNotetakerOnly])

  const queryKey = calendarEventsKey({ userId, locale })

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 lg:py-14">
      <Card>
        <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-primary">Recall automations</p>
            <CardTitle className="text-3xl font-semibold">
              Upcoming meetings
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage which meetings should automatically get a Recall.ai
              notetaker.
            </p>
            {isMounted && query.data?.serverTimestamp && (
              <p className="mt-2 text-xs text-muted-foreground">
                Synced{" "}
                {formatDistanceToNow(new Date(query.data.serverTimestamp), {
                  addSuffix: true,
                })}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {query.isFetching && (
              <Badge variant="secondary" className="gap-1">
                <RefreshCcw className="h-3 w-3 animate-spin" />
                Refreshing…
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => query.refetch()}
              disabled={query.isFetching}
              className="gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
            <div className="flex items-center gap-2 rounded-full border px-3 py-1">
              <Switch
                id="notetaker-only"
                checked={showNotetakerOnly}
                onCheckedChange={(checked) => setShowNotetakerOnly(checked)}
              />
              <label
                htmlFor="notetaker-only"
                className="text-sm text-muted-foreground"
              >
                Only show notetaker-ready
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {query.error && (
            <div className="mb-4 rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
              Failed to load meetings. Please try again.
            </div>
          )}
          <CalendarEventsList
            events={filteredEvents}
            locale={locale}
            queryKey={queryKey}
          />
        </CardContent>
      </Card>
    </main>
  )
}
