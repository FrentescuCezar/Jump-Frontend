"use client"

import { format } from "date-fns"
import {
  TIME_COLUMN_WIDTH,
  DAY_HEADER_HEIGHT,
  Z_INDEX_TIME_COLUMN,
  Z_INDEX_DAY_HEADER,
} from "@/features/calendar/constants/weekView"
import type { TimeColumnProps } from "../types"

export function TimeColumn({
  weekStart,
  timeSlots,
  rowHeights,
  currentTime,
}: TimeColumnProps) {
  return (
    <div
      className="shrink-0 sticky left-0 bg-[#1a1d24]"
      style={{
        width: `${TIME_COLUMN_WIDTH}px`,
        zIndex: Z_INDEX_TIME_COLUMN,
      }}
    >
      <div
        className="bg-[#1a1d24] border-b border-r border-gray-800/50 sticky top-0 flex items-center justify-center"
        style={{
          height: `${DAY_HEADER_HEIGHT}px`,
          zIndex: Z_INDEX_DAY_HEADER,
        }}
      >
        <span className="text-xs font-light text-gray-400">
          {format(weekStart, "MMM yyyy")}
        </span>
      </div>
      {timeSlots.map((time, timeIdx) => (
        <div
          key={time}
          className="flex items-start justify-end pr-3 pt-1 bg-[#1a1d24]"
          style={{ height: `${rowHeights[timeIdx]}px` }}
        >
          <span
            className={`text-xs ${
              timeIdx >= Math.floor(currentTime) &&
              timeIdx < Math.ceil(currentTime)
                ? "text-red-500 font-medium"
                : "text-gray-500"
            }`}
          >
            {time}
          </span>
        </div>
      ))}
    </div>
  )
}

