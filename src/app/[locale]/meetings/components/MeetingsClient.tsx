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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

type MeetingsClientProps = {
  userId: string
  locale: string
}

export default function MeetingsClient({ userId, locale }: MeetingsClientProps) {
  const upcoming = useCalendarEvents({ userId, locale, window: "upcoming" })
  const past = useCalendarEvents({ userId, locale, window: "past" })
  const showNotetakerOnly = useMeetingsStore((state) => state.showNotetakerOnly)
  const setShowNotetakerOnly = useMeetingsStore(
    (state) => state.setShowNotetakerOnly,
  )
  const activeTab = useMeetingsStore((state) => state.activeTab)
  const setActiveTab = useMeetingsStore((state) => state.setActiveTab)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const filteredEvents = useMemo(() => {
    if (!showNotetakerOnly) {
      return upcoming.events
    }
    return upcoming.events.filter((event) => event.notetakerEnabled)
  }, [upcoming.events, showNotetakerOnly])

  const upcomingQueryKey = calendarEventsKey({
    userId,
    locale,
    window: "upcoming",
  })
  const pastQueryKey = calendarEventsKey({
    userId,
    locale,
    window: "past",
  })

  const activeQuery = activeTab === "past" ? past.query : upcoming.query
  const activeTimestamp =
    activeTab === "past"
      ? past.query.data?.serverTimestamp
      : upcoming.query.data?.serverTimestamp

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 lg:py-14">
      <Card>
        <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-primary">Recall automations</p>
            <CardTitle className="text-3xl font-semibold">Meetings</CardTitle>
            <p className="text-sm text-muted-foreground">
              Toggle Recall bots for future calls and review insights from past
              meetings.
            </p>
            {isMounted && activeTimestamp && (
              <p className="mt-2 text-xs text-muted-foreground">
                Synced{" "}
                {formatDistanceToNow(new Date(activeTimestamp), {
                  addSuffix: true,
                })}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {activeQuery.isFetching && (
              <Badge variant="secondary" className="gap-1">
                <RefreshCcw className="h-3 w-3 animate-spin" />
                Refreshing…
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                (activeTab === "past" ? past.query : upcoming.query).refetch()
              }
              disabled={activeQuery.isFetching}
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
                disabled={activeTab === "past"}
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
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "upcoming" | "past")
            }
          >
            <TabsList className="mb-6">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming" className="space-y-4">
              {upcoming.query.error && (
                <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
                  Failed to load upcoming meetings. Please try again.
                </div>
              )}
              <CalendarEventsList
                events={filteredEvents}
                locale={locale}
                queryKey={upcomingQueryKey}
                showDetailLink
                showNotetakerToggle
              />
            </TabsContent>
            <TabsContent value="past" className="space-y-4">
              {past.query.error && (
                <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
                  Failed to load past meetings. Please try again.
                </div>
              )}
              <CalendarEventsList
                events={past.events}
                locale={locale}
                queryKey={pastQueryKey}
                showNotetakerToggle={false}
                showDetailLink
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  )
}
