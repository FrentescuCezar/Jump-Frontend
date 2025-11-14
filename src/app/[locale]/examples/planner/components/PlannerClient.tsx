"use client"

import { useQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { plannerProjectsQuery } from "@/features/examples/planner/queries"
import { PlannerRangeInput } from "@/schemas/examples/planner"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { usePlannerStore } from "@/features/examples/planner/store"
import { PlannerCalendarGrid } from "./PlannerCalendarGrid"
import { PlannerDayDetails } from "./PlannerDayDetails"
import { PlannerTemplates } from "./PlannerTemplates"
import { PlannerEntryForm } from "./PlannerEntryForm"
import {
  usePlannerEntries,
  usePlannerRange,
  usePlannerCrossTabSync,
} from "@/features/examples/planner/hooks"

type PlannerClientProps = {
  initialRange: PlannerRangeInput
}

export default function PlannerClient({ initialRange }: PlannerClientProps) {
  const t = useTranslations("Examples.Planner")
  const selectedDate = usePlannerStore((state) => state.selectedDate)

  const { range, shiftMonth, rangeLabel } = usePlannerRange(initialRange)
  const {
    query: entriesQuery,
    groupedDays,
    getEntriesForDate,
  } = usePlannerEntries(range)
  const catalogQuery = useQuery(plannerProjectsQuery())

  // Cross-tab synchronization
  usePlannerCrossTabSync(range)

  const activeEntries = getEntriesForDate(selectedDate)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:py-14">
      <Card className="border-primary/20 bg-card">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-sm text-primary">{t("badge")}</p>
            <CardTitle className="text-2xl">{t("title")}</CardTitle>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => shiftMonth(-1)}
              aria-label={t("actions.previous")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => shiftMonth(1)}
              aria-label={t("actions.next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="rounded-full border px-4 py-1 text-sm">
              {rangeLabel}
            </span>
            <Badge variant="outline">
              {t("totals.totalHours", {
                hours: entriesQuery.data?.totals.totalHours?.toFixed(1) ?? "0",
              })}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {(entriesQuery.isLoading || catalogQuery.isLoading) && (
        <div className="mt-8 text-center text-sm text-muted-foreground">
          {t("loading")}
        </div>
      )}
      {entriesQuery.error && (
        <div className="mt-8 rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          Error loading entries:{" "}
          {entriesQuery.error instanceof Error
            ? entriesQuery.error.message
            : "Unknown error"}
        </div>
      )}
      {!entriesQuery.isLoading && !entriesQuery.error && (
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <PlannerCalendarGrid
              monthStart={new Date(range.start)}
              days={groupedDays}
              isFetching={entriesQuery.isFetching}
            />
            <PlannerDayDetails
              entries={activeEntries}
              isFetching={entriesQuery.isFetching}
            />
          </div>

          <div className="space-y-6">
            <PlannerTemplates
              templates={catalogQuery.data?.templates ?? []}
              isLoading={catalogQuery.isLoading}
            />
            <PlannerEntryForm
              projects={catalogQuery.data?.projects ?? []}
              templates={catalogQuery.data?.templates ?? []}
              range={range}
            />
          </div>
        </div>
      )}
    </div>
  )
}
