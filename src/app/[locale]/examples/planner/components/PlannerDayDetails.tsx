"use client"

import { format } from "date-fns"
import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePlannerStore } from "@/features/examples/planner/store"
import { PlannerEntry } from "@/schemas/examples/planner"

type PlannerDayDetailsProps = {
  entries: PlannerEntry[]
  isFetching: boolean
}

export function PlannerDayDetails({
  entries,
  isFetching,
}: PlannerDayDetailsProps) {
  const t = useTranslations("Examples.Planner")
  const showDescriptions = usePlannerStore((state) => state.showDescriptions)
  const toggleDescriptions = usePlannerStore(
    (state) => state.toggleDescriptions,
  )
  const selectedDate = usePlannerStore((state) => state.selectedDate)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle>{t("details.title")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {format(new Date(selectedDate), "EEEE, MMM d")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isFetching && (
            <Badge variant="secondary">{t("timeline.refreshing")}</Badge>
          )}
          <Button variant="ghost" size="sm" onClick={toggleDescriptions}>
            {showDescriptions ? t("details.hide") : t("details.show")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {entries.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {t("details.empty")}
          </p>
        )}

        {entries.map((entry) => (
          <div
            key={entry.id}
            className="rounded-xl border bg-muted/40 px-4 py-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">{entry.projectName}</p>
                <p className="text-xs uppercase text-muted-foreground">
                  {entry.activityType}
                </p>
              </div>
              <Badge variant="outline">{entry.hours}h</Badge>
            </div>
            {showDescriptions && (
              <p className="mt-2 text-sm text-muted-foreground">
                {entry.description}
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}





