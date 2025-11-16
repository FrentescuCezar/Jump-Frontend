"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ChevronDown } from "lucide-react"
import { getBotStatusColor } from "../constants/botStatus"

type BotStatusFilterProps = {
  uniqueBotStatuses: string[]
  selectedStatuses: string[]
  onStatusChange: (status: string, checked: boolean) => void
  onSelectAll: () => void
}

export function BotStatusFilter({
  uniqueBotStatuses,
  selectedStatuses,
  onStatusChange,
  onSelectAll,
}: BotStatusFilterProps) {
  if (uniqueBotStatuses.length === 0) return null

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 min-w-[180px] justify-between rounded-full border-white/20 bg-white/5 text-white/90 hover:bg-white/10"
        >
          <span className="truncate">
            {selectedStatuses.length === 0
              ? "All Bot Statuses"
              : selectedStatuses.length === 1
                ? selectedStatuses[0]
                : `${selectedStatuses.length} selected`}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 rounded-2xl border border-white/10 bg-[#05060a]/95 text-gray-100 shadow-[0_25px_60px_rgba(3,7,18,0.85)]">
        <div className="space-y-3">
          <label className="text-sm font-medium block">Bot Status</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer hover:bg-white/5 rounded-md p-2 -m-2">
              <Checkbox
                checked={selectedStatuses.length === 0}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onSelectAll()
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
              const color = getBotStatusColor(status)
              const isChecked = selectedStatuses.includes(status)
              return (
                <label
                  key={status}
                  className="flex items-center gap-2 cursor-pointer hover:bg-white/5 rounded-md p-2 -m-2"
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      onStatusChange(status, checked)
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
  )
}


