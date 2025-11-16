"use client"

import { useMonthView } from "./hooks/useMonthView"
import { useMeetingsViewStore } from "@/features/calendar/store/meetingsView"
import { MonthViewHeader } from "./components/MonthViewHeader"
import { MonthViewCalendar } from "./components/MonthViewCalendar"
import { MonthViewSidebar } from "./components/MonthViewSidebar"
import type { MonthViewProps } from "./types"

export default function MonthView({
  events,
  currentDate,
  onDateClick,
  onEventClick,
  onMonthChange,
  isLoading,
}: MonthViewProps) {
  const {
    year,
    monthIndex,
    startDayOfWeek,
    daysInMonth,
    monthName,
  } = useMonthView(currentDate)
  const selectedDate = useMeetingsViewStore((state) => state.selectedDate)
  const setSelectedDate = useMeetingsViewStore((state) => state.setSelectedDate)

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    onDateClick(date)
  }

  return (
    <div className="flex h-full min-h-[720px] overflow-hidden rounded-[28px] border border-white/10 bg-white/5/70 backdrop-blur-2xl shadow-[0_40px_120px_rgba(3,7,18,0.65)]">
      <div className="flex-1 overflow-auto">
        <MonthViewHeader
          monthName={monthName}
          year={year}
          onMonthChange={onMonthChange}
          isLoading={isLoading}
        />

        <MonthViewCalendar
          year={year}
          monthIndex={monthIndex}
          startDayOfWeek={startDayOfWeek}
          daysInMonth={daysInMonth}
          events={events}
          selectedDate={selectedDate}
          onDateClick={handleDateClick}
          onEventClick={onEventClick}
        />
      </div>

      {selectedDate && (
        <MonthViewSidebar
          selectedDate={selectedDate}
          events={events}
          onClose={() => setSelectedDate(null)}
          onEventClick={onEventClick}
        />
      )}
    </div>
  )
}

