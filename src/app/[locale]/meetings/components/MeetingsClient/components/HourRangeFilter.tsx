"use client"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronDown } from "lucide-react"

type HourRangeFilterProps = {
  hourRange: { start: string; end: string } | null
  onHourRangeChange: (range: { start: string; end: string } | null) => void
}

export function HourRangeFilter({
  hourRange,
  onHourRangeChange,
}: HourRangeFilterProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 min-w-[180px] justify-between rounded-full border-white/20 bg-white/5 text-white/90 hover:bg-white/10 "
        >
          <span className="truncate">
            {hourRange
              ? `${hourRange.start.split(":")[0]} - ${hourRange.end.split(":")[0]}`
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
                  hourRange?.start ? hourRange.start.split(":")[0] : undefined
                }
                onValueChange={(value) => {
                  const currentEnd = hourRange?.end || "23:59"
                  onHourRangeChange({
                    start: `${value.padStart(2, "0")}:00`,
                    end: currentEnd,
                  })
                }}
              >
                <SelectTrigger className="flex-1 border-white/20 bg-white/5 text-white/90">
                  <SelectValue placeholder="From" />
                </SelectTrigger>
                <SelectContent className="bg-[#05060a] border-white/10 max-h-[200px] overflow-y-auto">
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
                value={hourRange?.end ? hourRange.end.split(":")[0] : undefined}
                onValueChange={(value) => {
                  const currentStart = hourRange?.start || "00:00"
                  onHourRangeChange({
                    start: currentStart,
                    end: `${value.padStart(2, "0")}:59`,
                  })
                }}
              >
                <SelectTrigger className="flex-1 border-white/20 bg-white/5 text-white/90">
                  <SelectValue placeholder="To" />
                </SelectTrigger>
                <SelectContent className="bg-[#05060a] border-white/10 max-h-[200px] overflow-y-auto">
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
            {hourRange && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full rounded-xl border-white/20 bg-white/5 text-white/90 hover:bg-white/10 "
                onClick={() => onHourRangeChange(null)}
              >
                Clear Hour Range
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

