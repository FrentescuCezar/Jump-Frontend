"use client"

import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { isToday } from "date-fns"
import { BASE_CELL_HEIGHT, WEEK_DAYS } from "../constants/monthView"
import { getEventsForDate } from "../utils/getEventsForDate"
import { calculateCellHeight } from "../utils/calculateCellHeight"
import { MonthEventCard } from "./MonthEventCard"
import type { CalendarEvent } from "@/features/calendar/types"

type MonthViewCalendarProps = {
  year: number
  monthIndex: number
  startDayOfWeek: number
  daysInMonth: number
  events: CalendarEvent[]
  selectedDate: Date | null
  onDateClick: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
}

export function MonthViewCalendar({
  year,
  monthIndex,
  startDayOfWeek,
  daysInMonth,
  events,
  selectedDate,
  onDateClick,
  onEventClick,
}: MonthViewCalendarProps) {
  // Track if component is mounted (client-side only) to avoid hydration mismatch
  const [isMounted, setIsMounted] = useState(false)
  const rowHeights: number[] = []
  const MAX_VISIBLE_EVENTS = 5

  const dayCells = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    const date = new Date(year, monthIndex, day)
    const dayEvents = getEventsForDate(events, date)
    const displayEvents = dayEvents.slice(0, MAX_VISIBLE_EVENTS)
    const remainingCount = Math.max(dayEvents.length - displayEvents.length, 0)
    const visibleRows = displayEvents.length + (remainingCount > 0 ? 1 : 0) || 1
    const computedHeight = calculateCellHeight(visibleRows)
    const gridPosition = startDayOfWeek + i
    const rowIndex = Math.floor(gridPosition / 7)
    rowHeights[rowIndex] = Math.max(
      rowHeights[rowIndex] ?? BASE_CELL_HEIGHT,
      computedHeight,
    )
    const isSelected = selectedDate?.toDateString() === date.toDateString()
    const isTodayDate = isMounted && isToday(date)

    return {
      day,
      date,
      displayEvents,
      remainingCount,
      rowIndex,
      isSelected,
      isTodayDate,
    }
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <div className="p-6">
      <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/5/40 backdrop-blur-2xl shadow-[0_25px_70px_rgba(3,7,18,0.55)]">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-white/10 bg-white/5/40">
          {WEEK_DAYS.map((day) => (
            <div
              key={day}
              className="px-4 py-3 text-center font-semibold uppercase tracking-wide text-xs text-gray-200"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: startDayOfWeek }, (_, i) => (
            <div
              key={`empty-${i}`}
              className="min-h-[120px] border-b border-r border-white/10 bg-white/5/20"
              style={{
                height: `${rowHeights[0] ?? BASE_CELL_HEIGHT}px`,
              }}
            />
          ))}

          {/* Days of the month */}
          {dayCells.map(
            (
              {
                day,
                date,
                displayEvents,
                remainingCount,
                rowIndex,
                isSelected,
                isTodayDate,
              },
              i,
            ) => (
              <motion.div
                key={day}
                initial={
                  isMounted
                    ? false
                    : {
                        opacity: 0,
                        scale: 0.95,
                      }
                }
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.3,
                  delay: i * 0.02,
                  type: "spring",
                  stiffness: 100,
                }}
                onClick={() => onDateClick(date)}
                suppressHydrationWarning
                className={`relative cursor-pointer border-b border-r border-white/10 bg-[#0c0f18]/80 transition-all duration-300 hover:bg-white/5 ${
                  isSelected
                    ? "bg-linear-to-br from-purple-500/20 to-cyan-500/10 shadow-[0_10px_30px_rgba(147,51,234,0.35)] ring-1 ring-purple-400/60"
                    : isTodayDate
                      ? "bg-linear-to-br from-pink-500/20 to-transparent ring-1 ring-pink-400/60"
                      : ""
                } ${!isSelected ? "last:border-r-0" : ""}`}
                style={{ height: `${rowHeights[rowIndex]}px` }}
              >
                {/* Day number */}
                <div
                  className={`absolute top-2 left-2 w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold ${
                    isTodayDate
                      ? "bg-pink-500 text-white shadow-lg"
                      : isSelected
                        ? "bg-purple-500 text-white shadow-lg"
                        : "bg-white/5 text-gray-300"
                  }`}
                >
                  {day}
                </div>

                {/* Events */}
                <div className="mt-10 px-2 space-y-1 overflow-hidden">
                  {displayEvents.map((event, eventIdx) => (
                    <MonthEventCard
                      key={event.id}
                      event={event}
                      eventIdx={eventIdx}
                      onEventClick={onEventClick}
                    />
                  ))}

                  {remainingCount > 0 && (
                    <div className="rounded px-2.5 py-1 text-xs font-semibold text-gray-300 bg-white/5 border border-dashed border-white/20 inline-flex items-center">
                      +{remainingCount} more
                    </div>
                  )}
                </div>
              </motion.div>
            ),
          )}
        </div>
      </div>
    </div>
  )
}
