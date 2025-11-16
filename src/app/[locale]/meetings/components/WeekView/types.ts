import type { CalendarEvent } from "@/features/calendar/types"
import type { MultiDayCalendarEvent } from "@/features/calendar/utils/multiDayEvents"

export type WeekViewProps = {
  events: CalendarEvent[]
  currentDate: Date
  onEventClick: (event: CalendarEvent) => void
  onWeekChange: (offset: number) => void
  isLoading?: boolean
}

export type WeekEventCardProps = {
  event: MultiDayCalendarEvent
  topPosition: number
  height: number
  leftOffset: number
  rightOffset: number
  zIndex: number
  groupIdx: number
  eventIdx: number
  onClick: () => void
}

export type TimeColumnProps = {
  weekStart: Date
  timeSlots: string[]
  rowHeights: number[]
  currentTime: number
}

export type DayColumnProps = {
  day: Date
  timedGroups: MultiDayCalendarEvent[][]
  allDayEvents: CalendarEvent[]
  rowHeights: number[]
  timeSlots: string[]
  onEventClick: (event: CalendarEvent) => void
}

export type AllDayEventCardProps = {
  event: CalendarEvent
  index: number
  onEventClick: (event: CalendarEvent) => void
}

export type CurrentTimeIndicatorProps = {
  currentTime: number
  rowHeights: number[]
  getCumulativeTop: (hour: number) => number
}

