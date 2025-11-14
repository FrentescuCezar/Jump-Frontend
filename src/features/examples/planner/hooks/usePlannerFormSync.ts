import { useEffect } from "react"
import type { UseFormSetValue, UseFormReset } from "react-hook-form"
import { usePlannerStore } from "../store"
import type { PlannerEntryInput, PlannerRangeInput, PlannerTemplate } from "@/schemas/examples/planner"

/**
 * Syncs form fields with Zustand state (selectedDate) and applies pinned templates
 */
export function usePlannerFormSync<T extends PlannerEntryInput>({
  setValue,
  reset,
  range,
  pinnedTemplate,
}: {
  setValue: UseFormSetValue<T>
  reset: UseFormReset<T>
  range: PlannerRangeInput
  pinnedTemplate?: PlannerTemplate
}) {
  const selectedDate = usePlannerStore((state) => state.selectedDate)

  // Sync form with Zustand state (selectedDate) and range changes
  useEffect(() => {
    setValue("date" as any, selectedDate, { shouldDirty: false })
    setValue("userId" as any, range.userId, { shouldDirty: false })
  }, [selectedDate, range.userId, setValue])

  // Apply pinned template when selected
  useEffect(() => {
    if (!pinnedTemplate) return
    reset(
      {
        userId: range.userId,
        date: selectedDate,
        projectId: pinnedTemplate.projectId,
        activityType: pinnedTemplate.activityType,
        hours: pinnedTemplate.hours,
        description: pinnedTemplate.description,
      } as T,
      { keepDefaultValues: false },
    )
  }, [pinnedTemplate, range.userId, selectedDate, reset])
}



