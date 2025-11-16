import type { CalendarEvent } from "@/features/calendar/types"

export type MonthViewProps = {
  events: CalendarEvent[]
  currentDate: Date
  onDateClick: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
  onMonthChange: (offset: number) => void
  isLoading?: boolean
}

export type MeetingIconProps = {
  type: string
  size?: "small" | "medium" | "large"
}

export type BotIconProps = {
  status: string | null | undefined
  size?: "small" | "medium" | "large"
}

export type MonthEventCardProps = {
  event: CalendarEvent
  eventIdx: number
  onEventClick: (event: CalendarEvent) => void
}

export type MonthViewHeaderProps = {
  monthName: string
  year: number
  onMonthChange: (offset: number) => void
  isLoading?: boolean
}

export type MonthViewSidebarProps = {
  selectedDate: Date
  events: CalendarEvent[]
  onClose: () => void
  onEventClick: (event: CalendarEvent) => void
}

