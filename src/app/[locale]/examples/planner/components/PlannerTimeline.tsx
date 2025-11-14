"use client"

import { format } from "date-fns"
import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePlannerStore } from "@/features/examples/planner/store"
import { PlannerEntry } from "@/schemas/examples/planner"

export type DayBucket = {
  date: string
  entries: PlannerEntry[]
  totalHours: number
}

type PlannerTimelineProps = {
  days: DayBucket[]
  isFetching: boolean
}

export function PlannerTimeline({
  days,
  isFetching,
}: PlannerTimelineProps) {
  const t = useTranslations("Examples.Planner")
  const selectedDate = usePlannerStore((state) => state.selectedDate)
  const selectDate = usePlannerStore((state) => state.selectDate)

  if (!days.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("timeline.title")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("timeline.empty")}
          </p>
        </CardHeader>
      </Card>
    )
  }

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
      <CardContent className="flex flex-wrap gap-3">
        {days.map((day) => {
          const isActive = day.date === selectedDate
          return (
            <button
              key={day.date}
              className={`flex min-w-[120px] flex-col rounded-xl border p-3 text-left transition ${
                isActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/60"
              }`}
              onClick={() => selectDate(day.date)}
            >
              <p className="text-xs text-muted-foreground">
                {format(new Date(day.date), "EEE")}
              </p>
              <p className="text-lg font-semibold">
                {format(new Date(day.date), "MMM d")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("timeline.hours", { hours: day.totalHours.toFixed(1) })}
              </p>
            </button>
          )
        })}
      </CardContent>
    </Card>
  )
}





