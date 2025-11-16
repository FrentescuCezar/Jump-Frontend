"use client"

import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ChevronDown } from "lucide-react"

type DateRangeFilterProps = {
  dateRange: { start: string | null; end: string | null }
  onDateRangeChange: (range: {
    start: string | null
    end: string | null
  }) => void
}

export function DateRangeFilter({
  dateRange,
  onDateRangeChange,
}: DateRangeFilterProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 min-w-[200px] justify-between rounded-full border-white/20 bg-white/5 text-white/90 hover:bg-white/10 "
        >
          <span className="truncate">
            {dateRange.start || dateRange.end
              ? `${dateRange.start ? format(new Date(dateRange.start), "MMM d") : "..."} - ${dateRange.end ? format(new Date(dateRange.end), "MMM d") : "..."}`
              : "Date Range"}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto rounded-2xl border border-white/10 bg-[#05060a]/95 text-gray-100 shadow-[0_25px_60px_rgba(3,7,18,0.85)] p-3">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Date Range</label>
            <Calendar
              mode="range"
              selected={{
                from: dateRange.start ? new Date(dateRange.start) : undefined,
                to: dateRange.end ? new Date(dateRange.end) : undefined,
              }}
              onSelect={(range: DateRange | undefined) => {
                onDateRangeChange({
                  start: range?.from ? range.from.toISOString() : null,
                  end: range?.to ? range.to.toISOString() : null,
                })
              }}
              numberOfMonths={2}
              className="rounded-md border-0"
              classNames={{
                months:
                  "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium text-gray-100",
                nav: "space-x-1 flex items-center",
                button_previous:
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-gray-100",
                button_next:
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-gray-100",
                month_caption: "flex justify-center pt-1 relative items-center",
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
            {(dateRange.start || dateRange.end) && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full rounded-xl border-white/20 bg-white/5 text-white/90 hover:bg-white/10 "
                onClick={() => onDateRangeChange({ start: null, end: null })}
              >
                Clear Date Range
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

