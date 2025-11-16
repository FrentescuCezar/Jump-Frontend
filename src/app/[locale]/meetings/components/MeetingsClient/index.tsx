"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Filter } from "lucide-react"
import { useCalendarEventsRange } from "@/features/calendar/hooks/useCalendarEventsRange"
import { useMeetingsViewStore } from "@/features/calendar/store/meetingsView"
import MonthView from "../MonthView"
import WeekView from "../WeekView"
import EventDetailsModal from "../EventDetailsModal"
import { useMeetingsFilters } from "./hooks/useMeetingsFilters"
import { useMeetingsSync } from "./hooks/useMeetingsSync"
import { FiltersPanel } from "./components/FiltersPanel"
import { ActiveFiltersBar } from "./components/ActiveFiltersBar"
import { SyncButton } from "./components/SyncButton"
import { ViewNavigation } from "./components/ViewNavigation"
import { countActiveFilters } from "./utils/hasActiveFilters"

type MeetingsClientProps = {
  userId: string
  locale: string
}

export default function MeetingsClient({
  userId,
  locale,
}: MeetingsClientProps) {
  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" })
  }, [])

  const viewType = useMeetingsViewStore((state) => state.viewType)
  const setViewType = useMeetingsViewStore((state) => state.setViewType)
  const currentDate = useMeetingsViewStore((state) => state.currentDate)
  const setCurrentDate = useMeetingsViewStore((state) => state.setCurrentDate)
  const selectedEventId = useMeetingsViewStore((state) => state.selectedEventId)
  const setSelectedEventId = useMeetingsViewStore(
    (state) => state.setSelectedEventId,
  )
  const shiftMonth = useMeetingsViewStore((state) => state.shiftMonth)
  const shiftWeek = useMeetingsViewStore((state) => state.shiftWeek)

  const [showFilters, setShowFilters] = useState(false)

  const { events, isLoading, isFetching, error, refetch } =
    useCalendarEventsRange({
      userId,
      locale,
      date: currentDate,
      viewType,
    })

  const {
    filters,
    setFilters,
    resetFilters,
    uniquePlatforms,
    uniqueBotStatuses,
    uniqueEmails,
    filteredEvents,
    hasActiveFilters,
    activeFilterCount,
  } = useMeetingsFilters(events)

  const { isAnySyncing, syncError, handleSync, syncNow } =
    useMeetingsSync(refetch)

  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null
    return filteredEvents.find((e) => e.id === selectedEventId) || null
  }, [selectedEventId, filteredEvents])

  const handleMonthChange = (offset: number) => {
    if (offset === 0) {
      setCurrentDate(new Date())
    } else {
      shiftMonth(offset)
    }
  }

  const handleWeekChange = (offset: number) => {
    if (offset === 0) {
      setCurrentDate(new Date())
    } else {
      shiftWeek(offset)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05060a] text-gray-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-[520px] w-[520px] rounded-full bg-purple-600/30 blur-[200px]" />
        <div className="absolute bottom-[-140px] right-[-100px] h-[520px] w-[520px] rounded-full bg-cyan-500/25 blur-[220px]" />
        <div className="absolute top-1/3 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-pink-500/10 blur-[180px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="sticky top-0 z-50 border-b border-white/5 bg-[#05060a]/95 shadow-[0_25px_70px_rgba(2,6,23,0.6)]">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-6 lg:px-10">
            <div className="flex flex-wrap items-center gap-3">
              <Tabs
                value={viewType}
                onValueChange={(v) => setViewType(v as "week" | "month")}
              >
                <TabsList>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                </TabsList>
              </Tabs>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={`gap-2 rounded-full border-white/20 bg-white/5 text-white/90 shadow-[0_15px_45px_rgba(147,51,234,0.35)] transition hover:bg-white/10 ${
                  showFilters ? "bg-white/15" : ""
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>

              <FiltersPanel
                showFilters={showFilters}
                uniquePlatforms={uniquePlatforms}
                uniqueBotStatuses={uniqueBotStatuses}
                uniqueEmails={uniqueEmails}
                filters={filters}
                onFiltersChange={setFilters}
              />

              {(viewType === "month" || viewType === "week") && (
                <SyncButton
                  isAnySyncing={isAnySyncing}
                  isFetching={isFetching}
                  syncError={syncError}
                  onSync={handleSync}
                  syncNow={syncNow}
                />
              )}

              <div className="ml-auto flex items-center gap-2">
                <ViewNavigation
                  viewType={viewType}
                  onPrevious={() => handleWeekChange(-1)}
                  onToday={() => handleWeekChange(0)}
                  onNext={() => handleWeekChange(1)}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>

          <ActiveFiltersBar
            filters={filters}
            onFiltersChange={setFilters}
            onClearAll={resetFilters}
          />
        </div>

        {error && (
          <div className="mx-auto mt-4 w-[calc(100%-2rem)] max-w-[1400px] rounded-2xl border border-destructive/60 bg-destructive/15 px-4 py-3 text-sm text-destructive shadow-[0_25px_70px_rgba(136,19,55,0.35)] sm:px-6">
            Failed to load meetings. Please try again.
          </div>
        )}

        <div className="relative z-10 flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-10">
          <div className="mx-auto w-full max-w-[1600px]">
            <div className="rounded-[40px] border border-white/10 bg-white/5/70 p-1  shadow-[0_55px_140px_rgba(2,6,23,0.75)]">
              <div className="rounded-[34px] border border-white/10 bg-[#070a12]/80 p-4 ">
                {viewType === "month" ? (
                  <MonthView
                    events={filteredEvents}
                    currentDate={currentDate}
                    onDateClick={(date) => setCurrentDate(date)}
                    onEventClick={(event) => setSelectedEventId(event.id)}
                    onMonthChange={handleMonthChange}
                    isLoading={isLoading}
                  />
                ) : (
                  <WeekView
                    events={filteredEvents}
                    currentDate={currentDate}
                    onEventClick={(event) => setSelectedEventId(event.id)}
                    onWeekChange={handleWeekChange}
                    isLoading={isLoading}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          locale={locale}
          userId={userId}
          onClose={() => setSelectedEventId(null)}
        />
      )}
    </div>
  )
}

