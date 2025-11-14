import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { plannerBroadcast } from "@/lib/broadcast-channel"
import { plannerEntriesKey } from "../queries"
import type { PlannerRangeInput } from "@/schemas/examples/planner"

/**
 * Listens for cross-tab updates and invalidates queries when entries are created/updated
 *
 * Note: This only works for tabs in the same browser on the same device.
 * For cross-device sync, you'd need WebSockets/SSE or polling.
 */
export function usePlannerCrossTabSync(range: PlannerRangeInput) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const unsubscribe = plannerBroadcast.subscribe((event) => {
      if (
        event.type === "planner-entry-created" ||
        event.type === "planner-entry-updated" ||
        event.type === "planner-entry-deleted"
      ) {
        queryClient.invalidateQueries({ queryKey: plannerEntriesKey(range) })
      }
    })

    return unsubscribe
  }, [queryClient, range])
}
