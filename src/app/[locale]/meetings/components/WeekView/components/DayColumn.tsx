"use client"

import { format, isToday, isSameDay } from "date-fns"
import {
  BASE_COLUMN_WIDTH,
  DAY_HEADER_HEIGHT,
  OFFSET_PER_EVENT,
  Z_INDEX_DAY_HEADER,
} from "@/features/calendar/constants/weekView"
import {
  calculateEventTopPosition,
  calculateEventHeight,
  calculateEventOffsets,
} from "@/features/calendar/utils/eventPosition"
import { WeekEventCard } from "./WeekEventCard"
import { AllDayEventCard } from "./AllDayEventCard"
import type { DayColumnProps } from "../types"

export function DayColumn({
  day,
  timedGroups,
  allDayEvents,
  rowHeights,
  timeSlots,
  onEventClick,
}: DayColumnProps) {
  const maxOverlap = Math.max(1, ...timedGroups.map((g) => g.length))
  const extraWidth = (maxOverlap - 1) * OFFSET_PER_EVENT

  const dayAllDayEvents = allDayEvents.filter((event) => {
    const eventDate = new Date(event.startTime)
    return isSameDay(eventDate, day)
  })

  return (
    <div
      className="relative border-r-2 border-gray-700"
      style={{
        minWidth: `${BASE_COLUMN_WIDTH + extraWidth}px`,
        flex: 1,
      }}
    >
      {/* Day header */}
      <div
        className="flex items-center justify-center border-b border-gray-800/50 sticky top-0 bg-[#1a1d24]"
        style={{
          height: `${DAY_HEADER_HEIGHT}px`,
          zIndex: Z_INDEX_DAY_HEADER,
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{format(day, "EEE")}</span>
          <span
            className={`text-base font-medium ${
              isToday(day)
                ? "bg-pink-500 rounded-full w-7 h-7 flex items-center justify-center text-white"
                : "text-gray-300"
            }`}
          >
            {format(day, "d")}
          </span>
        </div>
      </div>

      {/* All-day events */}
      {dayAllDayEvents.map((event, index) => (
        <AllDayEventCard
          key={event.id}
          event={event}
          index={index}
          onEventClick={onEventClick}
        />
      ))}

      {/* Time slots */}
      {timeSlots.map((time, timeIdx) => (
        <div
          key={time}
          className="border-t border-gray-800/50"
          style={{ height: `${rowHeights[timeIdx]}px` }}
        />
      ))}

      {/* Timed Events */}
      {timedGroups.map((group, groupIdx) => {
        return group.map((event, eventIdx) => {
          const topPosition = calculateEventTopPosition(event, rowHeights)
          const height = calculateEventHeight(event, rowHeights)
          const { leftOffset, rightOffset } = calculateEventOffsets(
            eventIdx,
            group.length,
          )

          return (
            <WeekEventCard
              key={event.id}
              event={event}
              topPosition={topPosition}
              height={height}
              leftOffset={leftOffset}
              rightOffset={rightOffset}
              zIndex={10 + eventIdx}
              groupIdx={groupIdx}
              eventIdx={eventIdx}
              onClick={() => onEventClick(event)}
            />
          )
        })
      })}
    </div>
  )
}

