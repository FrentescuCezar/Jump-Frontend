"use client"

import { useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useMeetingsViewStore } from "@/features/calendar/store/meetingsView"
import type { CalendarEvent } from "@/features/calendar/types"

type MeetingsFiltersProps = {
  events: CalendarEvent[]
}

export default function MeetingsFilters({ events }: MeetingsFiltersProps) {
  const filters = useMeetingsViewStore((state) => state.filters)
  const setFilters = useMeetingsViewStore((state) => state.setFilters)
  const resetFilters = useMeetingsViewStore((state) => state.resetFilters)
  
  const availablePlatforms = useMemo(() => {
    const platforms = new Set<string>()
    events.forEach((event) => {
      if (event.meetingPlatform && event.meetingPlatform !== "UNKNOWN") {
        platforms.add(event.meetingPlatform)
      }
    })
    return Array.from(platforms)
  }, [events])
  
  const availableBotStatuses = useMemo(() => {
    const statuses = new Set<string>()
    events.forEach((event) => {
      if (event.botStatus) {
        statuses.add(event.botStatus)
      }
    })
    return Array.from(statuses)
  }, [events])
  
  const availableCalendars = useMemo(() => {
    const calendars = new Set<string>()
    events.forEach((event) => {
      if (event.calendarTitle) {
        calendars.add(event.calendarTitle)
      }
    })
    return Array.from(calendars)
  }, [events])
  
  const toggleFilter = (type: "meetingPlatforms" | "botStatuses" | "calendars", value: string) => {
    const current = filters[type]
    const newValue = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    setFilters({ [type]: newValue })
  }
  
  const hasActiveFilters = 
    filters.meetingPlatforms.length > 0 ||
    filters.botStatuses.length > 0 ||
    filters.calendars.length > 0 ||
    filters.searchQuery.length > 0
  
  return (
    <div className="space-y-4 p-4 bg-[#1f2229] rounded-lg border border-gray-800/50">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-200">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-7 text-xs text-gray-400 hover:text-gray-200"
          >
            Clear all
          </Button>
        )}
      </div>
      
      {/* Search */}
      <div>
        <Input
          placeholder="Search events..."
          value={filters.searchQuery}
          onChange={(e) => setFilters({ searchQuery: e.target.value })}
          className="bg-[#1a1d24] border-gray-700 text-gray-200 placeholder:text-gray-500"
        />
      </div>
      
      {/* Meeting Platforms */}
      {availablePlatforms.length > 0 && (
        <div>
          <label className="text-xs font-medium text-gray-400 mb-2 block">
            Meeting Platforms
          </label>
          <div className="flex flex-wrap gap-2">
            {availablePlatforms.map((platform) => {
              const isActive = filters.meetingPlatforms.includes(platform)
              return (
                <Badge
                  key={platform}
                  variant={isActive ? "default" : "outline"}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => toggleFilter("meetingPlatforms", platform)}
                >
                  {platform.replace("_", " ")}
                  {isActive && <X className="w-3 h-3 ml-1" />}
                </Badge>
              )
            })}
          </div>
        </div>
      )}
      
      {/* Bot Statuses */}
      {availableBotStatuses.length > 0 && (
        <div>
          <label className="text-xs font-medium text-gray-400 mb-2 block">
            Bot Status
          </label>
          <div className="flex flex-wrap gap-2">
            {availableBotStatuses.map((status) => {
              const isActive = filters.botStatuses.includes(status)
              return (
                <Badge
                  key={status}
                  variant={isActive ? "default" : "outline"}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => toggleFilter("botStatuses", status)}
                >
                  {status}
                  {isActive && <X className="w-3 h-3 ml-1" />}
                </Badge>
              )
            })}
          </div>
        </div>
      )}
      
      {/* Calendars */}
      {availableCalendars.length > 0 && (
        <div>
          <label className="text-xs font-medium text-gray-400 mb-2 block">
            Calendars
          </label>
          <div className="flex flex-wrap gap-2">
            {availableCalendars.map((calendar) => {
              const isActive = filters.calendars.includes(calendar)
              return (
                <Badge
                  key={calendar}
                  variant={isActive ? "default" : "outline"}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => toggleFilter("calendars", calendar)}
                >
                  {calendar}
                  {isActive && <X className="w-3 h-3 ml-1" />}
                </Badge>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

