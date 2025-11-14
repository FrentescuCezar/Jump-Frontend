"use client"

import { useMemo, useEffect } from "react"
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isToday,
  isSameMonth,
  startOfWeek,
  endOfWeek,
} from "date-fns"
import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePlannerStore } from "@/features/examples/planner/store"
import type { DayBucket } from "./PlannerTimeline"

type PlannerCalendarGridProps = {
  monthStart: Date
  days: DayBucket[]
  isFetching: boolean
}

export function PlannerCalendarGrid({
  monthStart,
  days,
  isFetching,
}: PlannerCalendarGridProps) {
  const t = useTranslations("Examples.Planner")
  const selectedDate = usePlannerStore((state) => state.selectedDate)
  const selectDate = usePlannerStore((state) => state.selectDate)

  const calendarDays = useMemo(() => {
    const monthStartDate = startOfMonth(monthStart)
    const monthEndDate = endOfMonth(monthStart)
    const calendarStart = startOfWeek(monthStartDate, { weekStartsOn: 1 })
    const calendarEnd = endOfWeek(monthEndDate, { weekStartsOn: 1 })

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [monthStart])

  const daysMap = useMemo(() => {
    const map = new Map<string, DayBucket>()
    for (const day of days) {
      map.set(day.date, day)
    }
    return map
  }, [days])

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle>{t("timeline.title")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("timeline.subtitle")}
          </p>
        </div>
        {isFetching && (
          <Badge variant="secondary">{t("timeline.refreshing")}</Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-2 text-center text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
          {calendarDays.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd")
            const dayData = daysMap.get(dateStr)
            const isSelected = dateStr === selectedDate
            const isCurrentDay = isToday(day)
            const isCurrentMonth = isSameMonth(day, monthStart)
            const hasEntries = !!dayData && dayData.entries.length > 0

            const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault()
              e.stopPropagation()
              if (isCurrentMonth) {
                console.log("User manually selected date:", dateStr)
                selectDate(dateStr)
              }
            }

            return (
              <button
                key={dateStr}
                onClick={handleClick}
                disabled={!isCurrentMonth}
                aria-pressed={isSelected}
                aria-label={`Select ${format(day, "EEEE, MMMM d, yyyy")}`}
                className={`
                  group relative min-h-[80px] rounded-lg border p-2 text-left transition-all
                  focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                  ${
                    !isCurrentMonth
                      ? "opacity-30 cursor-not-allowed"
                      : isSelected
                        ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/20 cursor-pointer z-10"
                        : "border-border hover:border-primary/50 hover:bg-muted/60 hover:shadow-sm cursor-pointer active:scale-[0.98]"
                  }
                  ${isCurrentDay && !isSelected ? "ring-1 ring-primary/40" : ""}
                `}
                type="button"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`
                      text-sm font-medium
                      ${isCurrentDay ? "text-primary" : "text-foreground"}
                      ${!isCurrentMonth ? "text-muted-foreground" : ""}
                    `}
                  >
                    {format(day, "d")}
                  </span>
                  {isCurrentDay && (
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
                {hasEntries && dayData && (
                  <div className="mt-1.5 space-y-0.5">
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <div className="text-xs font-semibold text-primary">
                        {dayData.totalHours.toFixed(1)}h
                      </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground pl-2.5">
                      {dayData.entries.length}{" "}
                      {dayData.entries.length === 1 ? "entry" : "entries"}
                    </div>
                  </div>
                )}
                {!hasEntries && isCurrentMonth && (
                  <div className="mt-1 text-[10px] text-muted-foreground/50">
                    No entries
                  </div>
                )}
              </button>
            )
          })}
        </div>
        {days.length === 0 && !isFetching && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {t("timeline.empty")}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

