"use client"

import { useEffect, useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import FilterDropdown from "./FilterDropdown"
import {
  AlertTriangle,
  RefreshCw,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react"
import { useCalendarEventsRange } from "@/features/calendar/hooks/useCalendarEventsRange"
import { useMeetingsViewStore } from "@/features/calendar/store/meetingsView"
import { useCalendarSyncStore } from "@/features/calendar/store/sync"
import { calendarEventsKey } from "@/features/calendar/queries"
import { useShallow } from "zustand/react/shallow"
import MonthView from "./MonthView"
import WeekView from "./WeekView"
import EventDetailsModal from "./EventDetailsModal"
import type { CalendarEvent } from "@/features/calendar/types"

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

  const queryClient = useQueryClient()
  const viewType = useMeetingsViewStore((state) => state.viewType)
  const setViewType = useMeetingsViewStore((state) => state.setViewType)
  const currentDate = useMeetingsViewStore((state) => state.currentDate)
  const setCurrentDate = useMeetingsViewStore((state) => state.setCurrentDate)
  const filters = useMeetingsViewStore((state) => state.filters)
  const setFilters = useMeetingsViewStore((state) => state.setFilters)
  const resetFilters = useMeetingsViewStore((state) => state.resetFilters)
  const selectedEventId = useMeetingsViewStore((state) => state.selectedEventId)
  const setSelectedEventId = useMeetingsViewStore(
    (state) => state.setSelectedEventId,
  )
  const shiftMonth = useMeetingsViewStore((state) => state.shiftMonth)
  const shiftWeek = useMeetingsViewStore((state) => state.shiftWeek)

  const [isManualSyncing, setIsManualSyncing] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const { isSyncing, syncError, lastSummary, lastCompletedAt, syncNow } =
    useCalendarSyncStore(
      useShallow((state) => ({
        isSyncing: state.isSyncing,
        syncError: state.error,
        lastSummary: state.lastSummary,
        lastCompletedAt: state.lastCompletedAt,
        syncNow: state.syncNow,
      })),
    )

  const { events, isLoading, isFetching, error, refetch } =
    useCalendarEventsRange({
      userId,
      locale,
      date: currentDate,
      viewType,
    })

  // Get unique values for filters
  const uniquePlatforms = useMemo(() => {
    const platforms = new Set<string>()
    events.forEach((event) => {
      if (event.meetingPlatform && event.meetingPlatform !== "UNKNOWN") {
        platforms.add(event.meetingPlatform)
      }
    })
    return Array.from(platforms)
  }, [events])

  const uniqueBotStatuses = useMemo(() => {
    const statuses = new Set<string>()
    events.forEach((event) => {
      if (event.botStatus) {
        statuses.add(event.botStatus)
      }
    })
    return Array.from(statuses)
  }, [events])

  const uniqueEmails = useMemo(() => {
    const emails = new Set<string>()
    events.forEach((event) => {
      if (event.creatorEmail) {
        emails.add(event.creatorEmail)
      }
    })
    return Array.from(emails).sort()
  }, [events])

  // Apply filters
  const filteredEvents = useMemo(() => {
    let filtered = events

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(
        (event) =>
          event.title?.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.calendarTitle?.toLowerCase().includes(query),
      )
    }

    // Platform filter
    if (filters.meetingPlatforms.length > 0) {
      filtered = filtered.filter(
        (event) =>
          event.meetingPlatform &&
          filters.meetingPlatforms.includes(event.meetingPlatform),
      )
    }

    // Bot status filter
    if (filters.botStatuses.length > 0) {
      filtered = filtered.filter(
        (event) =>
          event.botStatus && filters.botStatuses.includes(event.botStatus),
      )
    }

    // Email filter
    if (filters.emails && filters.emails.length > 0) {
      filtered = filtered.filter(
        (event) =>
          event.creatorEmail && filters.emails.includes(event.creatorEmail),
      )
    }

    // Hour range filter
    if (filters.hourRange) {
      filtered = filtered.filter((event) => {
        if (!event.startTime) return false
        const eventDate = new Date(event.startTime)
        const eventHour = eventDate.getHours()
        const eventMinutes = eventDate.getMinutes()
        const eventTimeInMinutes = eventHour * 60 + eventMinutes

        const [startHour, startMin] = filters
          .hourRange!.start.split(":")
          .map(Number)
        const [endHour, endMin] = filters.hourRange!.end.split(":").map(Number)
        const startTimeInMinutes = startHour * 60 + startMin
        const endTimeInMinutes = endHour * 60 + endMin

        return (
          eventTimeInMinutes >= startTimeInMinutes &&
          eventTimeInMinutes <= endTimeInMinutes
        )
      })
    }

    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter((event) => {
        if (!event.startTime) return false
        const eventDate = new Date(event.startTime)
        eventDate.setHours(0, 0, 0, 0)

        if (filters.dateRange.start) {
          const startDate = new Date(filters.dateRange.start)
          startDate.setHours(0, 0, 0, 0)
          if (eventDate < startDate) return false
        }

        if (filters.dateRange.end) {
          const endDate = new Date(filters.dateRange.end)
          endDate.setHours(23, 59, 59, 999)
          if (eventDate > endDate) return false
        }

        return true
      })
    }

    return filtered
  }, [events, filters])

  const hasActiveFilters =
    (filters.meetingPlatforms?.length ?? 0) > 0 ||
    (filters.botStatuses?.length ?? 0) > 0 ||
    (filters.emails?.length ?? 0) > 0 ||
    (filters.searchQuery?.length ?? 0) > 0 ||
    filters.hourRange !== null ||
    filters.dateRange?.start !== null ||
    filters.dateRange?.end !== null

  const clearAllFilters = () => {
    resetFilters()
  }

  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null
    return filteredEvents.find((e) => e.id === selectedEventId) || null
  }, [selectedEventId, filteredEvents])

  const handleSync = async () => {
    if (!syncNow) {
      return
    }
    setIsManualSyncing(true)
    try {
      await syncNow()
      // Invalidate and remove calendar event queries to force fresh fetch after sync
      // This ensures deleted events are properly removed from the UI
      // We remove the queries (not just invalidate) to clear the serverTimestamp
      // which forces a full fetch instead of delta sync
      await queryClient.removeQueries({
        queryKey: ["calendar-events"],
      })
      await refetch()
    } catch (error) {
      console.error("Failed to sync calendar", error)
    } finally {
      setIsManualSyncing(false)
    }
  }

  const isAnySyncing = isSyncing || isManualSyncing

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
          <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center gap-3 px-4 py-4 sm:px-6 lg:px-10">
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
                  {[
                    filters.meetingPlatforms?.length ?? 0,
                    filters.botStatuses?.length ?? 0,
                    filters.emails?.length ?? 0,
                    (filters.searchQuery?.length ?? 0) > 0 ? 1 : 0,
                    filters.hourRange ? 1 : 0,
                    filters.dateRange?.start || filters.dateRange?.end ? 1 : 0,
                  ].reduce((a, b) => a + b, 0)}
                </Badge>
              )}
            </Button>

            {showFilters && (
              <div className="flex w-full flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5/30 p-3 text-sm shadow-[0_20px_60px_rgba(2,6,23,0.5)]">
                {uniquePlatforms.length > 0 && (
                  <FilterDropdown
                    label="Meeting Platforms"
                    options={uniquePlatforms}
                    selectedValues={filters.meetingPlatforms}
                    onValueChange={(value) => {
                      const currentPlatforms = filters.meetingPlatforms
                      if (currentPlatforms.includes(value)) {
                        setFilters({
                          meetingPlatforms: currentPlatforms.filter(
                            (p) => p !== value,
                          ),
                        })
                      } else {
                        setFilters({
                          meetingPlatforms: [...currentPlatforms, value],
                        })
                      }
                    }}
                    formatValue={(value) => {
                      if (value === "ZOOM") return "Zoom"
                      if (value === "MICROSOFT_TEAMS") return "Teams"
                      if (value === "GOOGLE_MEET") return "Google Meet"
                      return value.replace("_", " ")
                    }}
                    placeholder="All Meetings"
                  />
                )}

                {uniqueBotStatuses.length > 0 && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 min-w-[180px] justify-between rounded-full border-white/20 bg-white/5 text-white/90 hover:bg-white/10"
                      >
                        <span className="truncate">
                          {filters.botStatuses.length === 0
                            ? "All Bot Statuses"
                            : filters.botStatuses.length === 1
                              ? filters.botStatuses[0]
                              : `${filters.botStatuses.length} selected`}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 rounded-2xl border border-white/10 bg-[#05060a]/95 text-gray-100 shadow-[0_25px_60px_rgba(3,7,18,0.85)]">
                      <div className="space-y-3">
                        <label className="text-sm font-medium block">
                          Bot Status
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer hover:bg-white/5 rounded-md p-2 -m-2">
                            <Checkbox
                              checked={filters.botStatuses.length === 0}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFilters({ botStatuses: [] })
                                }
                              }}
                              className="border-gray-600 data-[state=checked]:bg-gray-600 data-[state=checked]:border-gray-600"
                            />
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-gray-500" />
                              <span className="text-sm">All</span>
                            </div>
                          </label>
                          {uniqueBotStatuses.map((status) => {
                            const getStatusColor = (s: string) => {
                              if (s === "DONE" || s === "COMPLETED")
                                return "#10b981" // green
                              if (s === "CANCELLED" || s === "CANCELED")
                                return "#ef4444" // red
                              if (
                                s === "UPCOMING" ||
                                s === "SCHEDULED" ||
                                s === "JOINING" ||
                                s === "IN_CALL"
                              )
                                return "#3b82f6" // blue
                              return "#6b7280" // gray
                            }
                            const color = getStatusColor(status)
                            const isChecked =
                              filters.botStatuses.includes(status)
                            return (
                              <label
                                key={status}
                                className="flex items-center gap-2 cursor-pointer hover:bg-white/5 rounded-md p-2 -m-2"
                              >
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={(checked) => {
                                    const currentStatuses = filters.botStatuses
                                    if (checked) {
                                      setFilters({
                                        botStatuses: [
                                          ...currentStatuses,
                                          status,
                                        ],
                                      })
                                    } else {
                                      setFilters({
                                        botStatuses: currentStatuses.filter(
                                          (s) => s !== status,
                                        ),
                                      })
                                    }
                                  }}
                                  style={
                                    isChecked
                                      ? {
                                          borderColor: color,
                                          backgroundColor: color,
                                        }
                                      : undefined
                                  }
                                  className={isChecked ? "" : "border-gray-600"}
                                />
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: color }}
                                  />
                                  <span className="text-sm">{status}</span>
                                </div>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}

                {uniqueEmails.length > 0 && (
                  <FilterDropdown
                    label="Emails"
                    options={uniqueEmails}
                    selectedValues={filters.emails || []}
                    onValueChange={(value) => {
                      const currentEmails = filters.emails || []
                      if (currentEmails.includes(value)) {
                        setFilters({
                          emails: currentEmails.filter((e) => e !== value),
                        })
                      } else {
                        setFilters({
                          emails: [...currentEmails, value],
                        })
                      }
                    }}
                    placeholder="All Emails"
                  />
                )}

                {/* Hour Range Filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 min-w-[180px] justify-between rounded-full border-white/20 bg-white/5 text-white/90 hover:bg-white/10 "
                    >
                      <span className="truncate">
                        {filters.hourRange
                          ? `${filters.hourRange.start.split(":")[0]} - ${filters.hourRange.end.split(":")[0]}`
                          : "Hour Range"}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 rounded-2xl border border-white/10 bg-[#05060a]/95 text-gray-100 shadow-[0_25px_60px_rgba(3,7,18,0.85)] ">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Hour Range
                        </label>
                        <div className="flex items-center gap-2">
                          <Select
                            value={
                              filters.hourRange?.start
                                ? filters.hourRange.start.split(":")[0]
                                : undefined
                            }
                            onValueChange={(value) => {
                              const currentEnd =
                                filters.hourRange?.end || "23:59"
                              setFilters({
                                hourRange: {
                                  start: `${value.padStart(2, "0")}:00`,
                                  end: currentEnd,
                                },
                              })
                            }}
                          >
                            <SelectTrigger className="flex-1 border-white/20 bg-white/5 text-white/90">
                              <SelectValue placeholder="From" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#05060a] border-white/10">
                              {Array.from({ length: 24 }, (_, i) => (
                                <SelectItem
                                  key={i}
                                  value={i.toString()}
                                  className="text-white hover:bg-white/10"
                                >
                                  {i.toString().padStart(2, "0")}:00
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="text-sm text-gray-400">to</span>
                          <Select
                            value={
                              filters.hourRange?.end
                                ? filters.hourRange.end.split(":")[0]
                                : undefined
                            }
                            onValueChange={(value) => {
                              const currentStart =
                                filters.hourRange?.start || "00:00"
                              setFilters({
                                hourRange: {
                                  start: currentStart,
                                  end: `${value.padStart(2, "0")}:59`,
                                },
                              })
                            }}
                          >
                            <SelectTrigger className="flex-1 border-white/20 bg-white/5 text-white/90">
                              <SelectValue placeholder="To" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#05060a] border-white/10">
                              {Array.from({ length: 24 }, (_, i) => (
                                <SelectItem
                                  key={i}
                                  value={i.toString()}
                                  className="text-white hover:bg-white/10"
                                >
                                  {i.toString().padStart(2, "0")}:59
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {filters.hourRange && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 w-full rounded-xl border-white/20 bg-white/5 text-white/90 hover:bg-white/10 "
                            onClick={() => setFilters({ hourRange: null })}
                          >
                            Clear Hour Range
                          </Button>
                        )}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Date Range Filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 min-w-[200px] justify-between rounded-full border-white/20 bg-white/5 text-white/90 hover:bg-white/10 "
                    >
                      <span className="truncate">
                        {filters.dateRange.start || filters.dateRange.end
                          ? `${filters.dateRange.start ? format(new Date(filters.dateRange.start), "MMM d") : "..."} - ${filters.dateRange.end ? format(new Date(filters.dateRange.end), "MMM d") : "..."}`
                          : "Date Range"}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto rounded-2xl border border-white/10 bg-[#05060a]/95 text-gray-100 shadow-[0_25px_60px_rgba(3,7,18,0.85)] p-3">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Date Range
                        </label>
                        <Calendar
                          mode="range"
                          selected={{
                            from: filters.dateRange.start
                              ? new Date(filters.dateRange.start)
                              : undefined,
                            to: filters.dateRange.end
                              ? new Date(filters.dateRange.end)
                              : undefined,
                          }}
                          onSelect={(range: DateRange | undefined) => {
                            setFilters({
                              dateRange: {
                                start: range?.from
                                  ? range.from.toISOString()
                                  : null,
                                end: range?.to ? range.to.toISOString() : null,
                              },
                            })
                          }}
                          numberOfMonths={2}
                          className="rounded-md border-0"
                          classNames={{
                            months:
                              "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                            month: "space-y-4",
                            caption:
                              "flex justify-center pt-1 relative items-center",
                            caption_label: "text-sm font-medium text-gray-100",
                            nav: "space-x-1 flex items-center",
                            button_previous:
                              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-gray-100",
                            button_next:
                              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-gray-100",
                            month_caption:
                              "flex justify-center pt-1 relative items-center",
                            table: "w-full border-collapse space-y-1",
                            head_row: "flex",
                            head_cell:
                              "text-gray-400 rounded-md w-9 font-normal text-[0.8rem]",
                            row: "flex w-full mt-2",
                            cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-white/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-gray-100 hover:bg-white/10 rounded-md",
                            day_selected:
                              "bg-white/20 text-white hover:bg-white/20 hover:text-white focus:bg-white/20 focus:text-white",
                            day_today: "bg-white/5 text-gray-100",
                            day_outside:
                              "text-gray-600 opacity-50 aria-selected:bg-white/10 aria-selected:text-gray-400",
                            day_disabled: "text-gray-600 opacity-50",
                            day_range_middle:
                              "aria-selected:bg-white/10 aria-selected:text-gray-100",
                            day_hidden: "invisible",
                          }}
                        />
                        {(filters.dateRange.start || filters.dateRange.end) && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 w-full rounded-xl border-white/20 bg-white/5 text-white/90 hover:bg-white/10 "
                            onClick={() =>
                              setFilters({
                                dateRange: { start: null, end: null },
                              })
                            }
                          >
                            Clear Date Range
                          </Button>
                        )}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {viewType === "week" && (
              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleWeekChange(-1)}
                  className="h-8 w-8 rounded-full border-white/20 bg-white/5 p-0 text-white/90 shadow-[0_15px_45px_rgba(3,7,18,0.55)] hover:bg-white/10  disabled:opacity-50"
                  disabled={isLoading}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleWeekChange(0)}
                  className="h-8 rounded-full border-white/20 bg-white/5 px-3 text-xs text-white/90 shadow-[0_15px_45px_rgba(3,7,18,0.55)] hover:bg-white/10  disabled:opacity-50"
                  disabled={isLoading}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleWeekChange(1)}
                  className="h-8 w-8 rounded-full border-white/20 bg-white/5 p-0 text-white/90 shadow-[0_15px_45px_rgba(3,7,18,0.55)] hover:bg-white/10  disabled:opacity-50"
                  disabled={isLoading}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {viewType === "month" && (
              <div className="ml-auto flex items-center gap-2">
                {isAnySyncing && !isFetching && (
                  <Badge
                    variant="secondary"
                    className="gap-1 rounded-full bg-white/5 text-white/80 "
                  >
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Syncing…
                  </Badge>
                )}
                {syncError && !isAnySyncing && (
                  <Badge
                    variant="destructive"
                    className="gap-1"
                    title={syncError}
                  >
                    <AlertTriangle className="h-3 w-3" />
                    Sync failed
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSync}
                  disabled={isAnySyncing || !syncNow}
                  className="h-8 gap-2 rounded-full border-white/20 bg-white/5 text-white/90 shadow-[0_15px_45px_rgba(3,7,18,0.55)] hover:bg-white/10  disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isAnySyncing ? "animate-spin" : ""}`}
                  />
                  {isAnySyncing ? "Syncing…" : "Sync"}
                </Button>
              </div>
            )}

            {viewType === "week" && (
              <div className="ml-auto flex items-center gap-2">
                {isAnySyncing && !isFetching && (
                  <Badge
                    variant="secondary"
                    className="gap-1 rounded-full bg-white/5 text-white/80 "
                  >
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Syncing…
                  </Badge>
                )}
                {syncError && !isAnySyncing && (
                  <Badge
                    variant="destructive"
                    className="gap-1"
                    title={syncError}
                  >
                    <AlertTriangle className="h-3 w-3" />
                    Sync failed
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSync}
                  disabled={isAnySyncing || !syncNow}
                  className="h-8 gap-2 rounded-full border-white/20 bg-white/5 text-white/90 shadow-[0_15px_45px_rgba(3,7,18,0.55)] hover:bg-white/10  disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isAnySyncing ? "animate-spin" : ""}`}
                  />
                  {isAnySyncing ? "Syncing…" : "Sync"}
                </Button>
              </div>
            )}
          </div>
          {hasActiveFilters && (
            <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center gap-2 px-4 pb-4 text-sm sm:px-6 lg:px-10">
              {filters.meetingPlatforms.map((platform) => (
                <Badge
                  key={platform}
                  variant="secondary"
                  className="gap-1 rounded-full border-white/10 bg-white/10 "
                >
                  {platform === "ZOOM"
                    ? "Zoom"
                    : platform === "MICROSOFT_TEAMS"
                      ? "Teams"
                      : platform === "GOOGLE_MEET"
                        ? "Google Meet"
                        : platform.replace("_", " ")}
                  <X
                    className="w-3 h-3 cursor-pointer hover:opacity-70"
                    onClick={() =>
                      setFilters({
                        meetingPlatforms: filters.meetingPlatforms.filter(
                          (p) => p !== platform,
                        ),
                      })
                    }
                  />
                </Badge>
              ))}
              {filters.botStatuses.map((status) => (
                <Badge
                  key={status}
                  variant="secondary"
                  className="gap-1 rounded-full border-white/10 bg-white/10 "
                >
                  Bot: {status}
                  <X
                    className="w-3 h-3 cursor-pointer hover:opacity-70"
                    onClick={() =>
                      setFilters({
                        botStatuses: filters.botStatuses.filter(
                          (s) => s !== status,
                        ),
                      })
                    }
                  />
                </Badge>
              ))}
              {(filters.emails || []).map((email) => (
                <Badge
                  key={email}
                  variant="secondary"
                  className="gap-1 rounded-full border-white/10 bg-white/10 "
                >
                  {email}
                  <X
                    className="w-3 h-3 cursor-pointer hover:opacity-70"
                    onClick={() =>
                      setFilters({
                        emails: (filters.emails || []).filter(
                          (e) => e !== email,
                        ),
                      })
                    }
                  />
                </Badge>
              ))}
              {filters.searchQuery && (
                <Badge
                  variant="secondary"
                  className="gap-1 rounded-full border-white/10 bg-white/10 "
                >
                  Search: {filters.searchQuery}
                  <X
                    className="w-3 h-3 cursor-pointer hover:opacity-70"
                    onClick={() => setFilters({ searchQuery: "" })}
                  />
                </Badge>
              )}
              {filters.hourRange && (
                <Badge
                  variant="secondary"
                  className="gap-1 rounded-full border-white/10 bg-white/10 "
                >
                  Hours: {filters.hourRange.start.split(":")[0]} -{" "}
                  {filters.hourRange.end.split(":")[0]}
                  <X
                    className="w-3 h-3 cursor-pointer hover:opacity-70"
                    onClick={() => setFilters({ hourRange: null })}
                  />
                </Badge>
              )}
              {(filters.dateRange.start || filters.dateRange.end) && (
                <Badge
                  variant="secondary"
                  className="gap-1 rounded-full border-white/10 bg-white/10 "
                >
                  Date:{" "}
                  {filters.dateRange.start
                    ? format(new Date(filters.dateRange.start), "MMM d")
                    : "..."}{" "}
                  -{" "}
                  {filters.dateRange.end
                    ? format(new Date(filters.dateRange.end), "MMM d")
                    : "..."}
                  <X
                    className="w-3 h-3 cursor-pointer hover:opacity-70"
                    onClick={() =>
                      setFilters({
                        dateRange: { start: null, end: null },
                      })
                    }
                  />
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="h-7 gap-2 rounded-full border-white/20 bg-white/5 px-3 text-xs text-white/80 hover:bg-white/10 "
              >
                Clear All
              </Button>
            </div>
          )}
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
