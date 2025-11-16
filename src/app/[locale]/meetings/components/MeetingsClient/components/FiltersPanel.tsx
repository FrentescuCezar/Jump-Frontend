"use client"

import { BotStatusFilter } from "./BotStatusFilter"
import { HourRangeFilter } from "./HourRangeFilter"
import { DateRangeFilter } from "./DateRangeFilter"
import { MeetingPlatformsFilter } from "./MeetingPlatformsFilter"
import { EmailsFilter } from "./EmailsFilter"
import type { MeetingsFilters } from "@/features/calendar/store/meetingsView"

type FiltersPanelProps = {
  showFilters: boolean
  uniquePlatforms: string[]
  uniqueBotStatuses: string[]
  uniqueEmails: string[]
  filters: MeetingsFilters
  onFiltersChange: (filters: Partial<MeetingsFilters>) => void
}

export function FiltersPanel({
  showFilters,
  uniquePlatforms,
  uniqueBotStatuses,
  uniqueEmails,
  filters,
  onFiltersChange,
}: FiltersPanelProps) {
  if (!showFilters) return null

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5/30 p-3 text-sm shadow-[0_20px_60px_rgba(2,6,23,0.5)] shrink-0">
      {uniquePlatforms.length > 0 && (
        <MeetingPlatformsFilter
          uniquePlatforms={uniquePlatforms}
          selectedPlatforms={filters.meetingPlatforms}
          onPlatformChange={(platform, checked) => {
            const currentPlatforms = filters.meetingPlatforms
            if (checked) {
              onFiltersChange({
                meetingPlatforms: [...currentPlatforms, platform],
              })
            } else {
              onFiltersChange({
                meetingPlatforms: currentPlatforms.filter((p) => p !== platform),
              })
            }
          }}
          onSelectAll={() => {
            onFiltersChange({ meetingPlatforms: [] })
          }}
        />
      )}

      {uniqueBotStatuses.length > 0 && (
        <BotStatusFilter
          uniqueBotStatuses={uniqueBotStatuses}
          selectedStatuses={filters.botStatuses}
          onStatusChange={(status, checked) => {
            const currentStatuses = filters.botStatuses
            if (checked) {
              onFiltersChange({
                botStatuses: [...currentStatuses, status],
              })
            } else {
              onFiltersChange({
                botStatuses: currentStatuses.filter((s) => s !== status),
              })
            }
          }}
          onSelectAll={() => {
            onFiltersChange({ botStatuses: [] })
          }}
        />
      )}

      {uniqueEmails.length > 0 && (
        <EmailsFilter
          uniqueEmails={uniqueEmails}
          selectedEmails={filters.emails || []}
          onEmailChange={(email, checked) => {
            const currentEmails = filters.emails || []
            if (checked) {
              onFiltersChange({
                emails: [...currentEmails, email],
              })
            } else {
              onFiltersChange({
                emails: currentEmails.filter((e) => e !== email),
              })
            }
          }}
          onSelectAll={() => {
            onFiltersChange({ emails: [] })
          }}
        />
      )}

      <HourRangeFilter
        hourRange={filters.hourRange}
        onHourRangeChange={(range) => {
          onFiltersChange({ hourRange: range })
        }}
      />

      <DateRangeFilter
        dateRange={filters.dateRange}
        onDateRangeChange={(range) => {
          onFiltersChange({ dateRange: range })
        }}
      />
    </div>
  )
}

