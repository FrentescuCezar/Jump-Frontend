"use client"

import { useMemo, useRef, useEffect } from "react"
import { startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns"
import type { CalendarEvent } from "@/features/calendar/types"
import { useWeekViewRowHeights } from "@/features/calendar/hooks/useWeekViewRowHeights"
import { useWeekViewLayout } from "@/features/calendar/hooks/useWeekViewLayout"
import {
  splitMultiDayEvents,
  separateAllDayEvents,
} from "@/features/calendar/utils/multiDayEvents"
import { TIME_COLUMN_WIDTH } from "@/features/calendar/constants/weekView"
import { useWeekView } from "./hooks/useWeekView"
import { generateTimeSlots, formatHour, getCumulativeTop, getHourFromYPosition } from "./utils"
import { TimeColumn } from "./components/TimeColumn"
import { DayColumn } from "./components/DayColumn"
import { CurrentTimeIndicator } from "./components/CurrentTimeIndicator"
import { Z_INDEX_CURRENT_TIME } from "@/features/calendar/constants/weekView"
import type { WeekViewProps } from "./types"

const HOVER_LABEL_HORIZONTAL_PADDING = 8

export default function WeekView({
  events,
  currentDate,
  onEventClick,
  onWeekChange,
  isLoading,
}: WeekViewProps) {
  const { currentTime, calendarRef } = useWeekView()

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // Separate all-day events from timed events
  const { allDayEvents, timedEvents } = useMemo(() => {
    return separateAllDayEvents(events)
  }, [events])

  // Split multi-day events into segments (only for timed events)
  const splitEvents = useMemo(() => {
    return splitMultiDayEvents(timedEvents, weekStart)
  }, [timedEvents, weekStart])

  const timeSlots = useMemo(() => generateTimeSlots(), [])
  const rowHeights = useWeekViewRowHeights(splitEvents, weekDays)
  const dayLayouts = useWeekViewLayout(splitEvents, weekDays)

  const getCumulativeTopForHour = (hour: number) =>
    getCumulativeTop(hour, rowHeights)

  const hoverIndicatorRef = useRef<HTMLDivElement>(null)
  const hoverLabelRef = useRef<HTMLDivElement>(null)
  const hoverFrameRef = useRef<number | null>(null)
  const hoverPayloadRef = useRef<{ top: number; hour: number; labelX: number } | null>(
    null,
  )

  const setHoverVisible = (visible: boolean) => {
    if (hoverIndicatorRef.current) {
      hoverIndicatorRef.current.style.opacity = visible ? "1" : "0"
    }
  }

  const getLabelXPosition = (clientX: number) => {
    const indicatorEl = hoverIndicatorRef.current
    if (!indicatorEl) return 0
    const rect = indicatorEl.getBoundingClientRect()
    const width = rect.width
    if (width <= 0) return 0
    const relativeX = clientX - rect.left
    const minPosition = HOVER_LABEL_HORIZONTAL_PADDING
    const maxPosition = width - HOVER_LABEL_HORIZONTAL_PADDING

    if (maxPosition <= minPosition) {
      return width / 2
    }

    return Math.min(Math.max(relativeX, minPosition), maxPosition)
  }

  const updateHoverIndicator = (top: number, hour: number, labelX: number) => {
    if (!hoverIndicatorRef.current) return
    hoverIndicatorRef.current.style.transform = `translateY(${top}px)`
    setHoverVisible(true)
    if (hoverLabelRef.current) {
      hoverLabelRef.current.textContent = formatHour(hour)
      hoverLabelRef.current.style.left = `${labelX}px`
    }
  }

  const commitHoverFrame = () => {
    hoverFrameRef.current = null
    const payload = hoverPayloadRef.current
    if (!payload) {
      setHoverVisible(false)
      return
    }
    updateHoverIndicator(payload.top, payload.hour, payload.labelX)
  }

  const scheduleHoverFrame = () => {
    if (hoverFrameRef.current !== null) return
    hoverFrameRef.current = requestAnimationFrame(commitHoverFrame)
  }

  useEffect(() => {
    return () => {
      if (hoverFrameRef.current !== null) {
        cancelAnimationFrame(hoverFrameRef.current)
      }
    }
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!calendarRef.current) return

    const rect = calendarRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Only show hover indicator when mouse is over the day columns area (not time column)
    if (x > TIME_COLUMN_WIDTH) {
      const hour = getHourFromYPosition(e.clientY, calendarRef, rowHeights)
      const baseHour = Math.floor(hour)
      const baseTop = getCumulativeTopForHour(baseHour)
      const rowHeight = rowHeights[baseHour] ?? rowHeights[rowHeights.length - 1] ?? 0
      const fractional = hour - baseHour
      const top = baseTop + fractional * rowHeight
      const labelX = getLabelXPosition(e.clientX)
      hoverPayloadRef.current = { top, hour, labelX }
    } else {
      hoverPayloadRef.current = null
    }

    scheduleHoverFrame()
  }

  const handleMouseLeave = () => {
    hoverPayloadRef.current = null
    scheduleHoverFrame()
  }

  return (
    <div style={{ width: "100%", overflowY: "visible" }}>
      <div style={{ overflowX: "auto", overflowY: "hidden", width: "100%" }}>
        <div
          ref={calendarRef}
          className="flex relative"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ minWidth: "max-content" }}
        >
          <TimeColumn
            weekStart={weekStart}
            timeSlots={timeSlots}
            rowHeights={rowHeights}
            currentTime={currentTime}
          />

          {/* Day columns */}
          <div className="flex-1 flex relative">
            <CurrentTimeIndicator
              currentTime={currentTime}
              rowHeights={rowHeights}
              getCumulativeTop={getCumulativeTopForHour}
            />

            <div
              ref={hoverIndicatorRef}
              className="pointer-events-none absolute left-0 right-0 opacity-0 transition-opacity duration-75"
              style={{ zIndex: Z_INDEX_CURRENT_TIME + 1, transform: "translateY(0px)" }}
            >
              <div className="h-0.5 w-full bg-gray-500" />
              <div className="absolute left-0 -top-1 h-2 w-2 rounded-full bg-gray-500" />
              <div
                ref={hoverLabelRef}
                className="absolute -top-6 whitespace-nowrap rounded bg-gray-700/90 px-2 py-1 text-xs text-gray-200 transform -translate-x-1/2"
                style={{ zIndex: Z_INDEX_CURRENT_TIME + 2, left: 0 }}
              >
                --
              </div>
            </div>

            {weekDays.map((day) => {
              const dayKey = day.toISOString()
              const timedGroups = dayLayouts[dayKey] || []

              return (
                <DayColumn
                  key={dayKey}
                  day={day}
                  timedGroups={timedGroups}
                  allDayEvents={allDayEvents}
                  rowHeights={rowHeights}
                  timeSlots={timeSlots}
                  onEventClick={onEventClick}
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

