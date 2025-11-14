import { getPlannerProjectsAction } from "@/app/[locale]/examples/planner/actions/getPlannerProjectsAction"
import type { PlannerRangeInput } from "@/schemas/examples/planner"
import type { QueryClient } from "@tanstack/react-query"
import { plannerEntriesQueryFn } from "./queries/plannerEntriesQueryFn"
import { plannerEntriesKey, plannerProjectsKey } from "./queries/keys"
import {
  plannerEntriesQueryConfig,
  plannerProjectsQueryConfig,
} from "./queries/config"

export { plannerEntriesKey, plannerProjectsKey }

export const plannerEntriesQuery = (
  input: PlannerRangeInput,
  queryClient?: QueryClient,
) => ({
  queryKey: plannerEntriesKey(input),
  queryFn: () => plannerEntriesQueryFn(input, queryClient),
  ...plannerEntriesQueryConfig,
})

export const plannerProjectsQuery = () => ({
  queryKey: plannerProjectsKey,
  queryFn: () => getPlannerProjectsAction(),
  ...plannerProjectsQueryConfig,
})
