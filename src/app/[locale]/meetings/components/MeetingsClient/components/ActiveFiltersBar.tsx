"use client"

import { format } from "date-fns"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { MeetingsFilters } from "@/features/calendar/store/meetingsView"

type ActiveFiltersBarProps = {
  filters: MeetingsFilters
  onFiltersChange: (filters: Partial<MeetingsFilters>) => void
  onClearAll: () => void
}

export function ActiveFiltersBar({
  filters,
  onFiltersChange,
  onClearAll,
}: ActiveFiltersBarProps) {
  const hasActive =
    (filters.meetingPlatforms?.length ?? 0) > 0 ||
    (filters.botStatuses?.length ?? 0) > 0 ||
    (filters.emails?.length ?? 0) > 0 ||
    (filters.searchQuery?.length ?? 0) > 0 ||
    filters.hourRange !== null ||
    filters.dateRange?.start !== null ||
    filters.dateRange?.end !== null

  if (!hasActive) return null

  return (
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
              onFiltersChange({
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
              onFiltersChange({
                botStatuses: filters.botStatuses.filter((s) => s !== status),
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
              onFiltersChange({
                emails: (filters.emails || []).filter((e) => e !== email),
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
            onClick={() => onFiltersChange({ searchQuery: "" })}
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
            onClick={() => onFiltersChange({ hourRange: null })}
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
              onFiltersChange({
                dateRange: { start: null, end: null },
              })
            }
          />
        </Badge>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={onClearAll}
        className="h-7 gap-2 rounded-full border-white/20 bg-white/5 px-3 text-xs text-white/80 hover:bg-white/10 "
      >
        Clear All
      </Button>
    </div>
  )
}

