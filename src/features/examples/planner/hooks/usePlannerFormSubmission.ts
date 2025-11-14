import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import type { UseFormReset } from "react-hook-form"
import { plannerBroadcast } from "@/lib/broadcast-channel"
import { plannerEntriesKey } from "../queries"
import type { PlannerRangeInput, PlannerEntryInput } from "@/schemas/examples/planner"
import type { FormResult } from "@/lib/forms"

/**
 * Handles form submission success: invalidates cache, resets description, and broadcasts to other tabs
 */
export function usePlannerFormSubmission<T extends PlannerEntryInput>({
  state,
  reset,
  range,
}: {
  state: FormResult<T>
  reset: UseFormReset<T>
  range: PlannerRangeInput
}) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!state.ok) return

    // Invalidate cache to refetch entries
    queryClient.invalidateQueries({ queryKey: plannerEntriesKey(range) })

    // Reset description field only
    reset((prev) => ({ ...prev, description: "" } as T), { keepValues: true })

    // Broadcast to other tabs for cross-tab sync
    plannerBroadcast.post({
      type: "planner-entry-created",
      payload: { range },
    })
  }, [state.ok, queryClient, range, reset])
}



