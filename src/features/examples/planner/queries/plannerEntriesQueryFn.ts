import { getPlannerEntriesAction } from "@/app/[locale]/examples/planner/actions/getPlannerEntriesAction"
import { getPlannerEntriesDeltaSyncAction } from "@/app/[locale]/examples/planner/actions/getPlannerEntriesDeltaSyncAction"
import type { PlannerRangeInput, PlannerEntriesResponse } from "@/schemas/examples/planner"
import type { QueryClient } from "@tanstack/react-query"
import { mergeDeltaEntries } from "../utils/mergeDeltaEntries"
import { plannerEntriesKey } from "./keys"

export async function plannerEntriesQueryFn(
  input: PlannerRangeInput,
  queryClient?: QueryClient,
): Promise<PlannerEntriesResponse> {
  if (!queryClient) {
    return getPlannerEntriesAction(input)
  }

  const cachedData = queryClient.getQueryData<PlannerEntriesResponse>(
    plannerEntriesKey(input),
  )

  if (!cachedData?.serverTimestamp) {
    return getPlannerEntriesAction(input)
  }

  try {
    const delta = await getPlannerEntriesDeltaSyncAction({
      userId: input.userId,
      updatedSince: cachedData.serverTimestamp,
      start: input.start,
      end: input.end,
    })

    if (delta.entries.length > 0) {
      console.log(
        `[Delta-sync] Found ${delta.entries.length} updated entries`,
        delta.entries.map((e) => ({ id: e.id, date: e.date })),
      )
    }

    const merged = mergeDeltaEntries(cachedData, delta)

    if (merged.entries.length !== cachedData.entries.length) {
      console.log(
        `[Delta-sync] Entry count changed: ${cachedData.entries.length} → ${merged.entries.length}`,
      )
    }

    return merged
  } catch (error) {
    console.warn("Delta-sync failed, falling back to full query:", error)
    return getPlannerEntriesAction(input)
  }
}

