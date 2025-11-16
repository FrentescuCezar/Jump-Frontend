import type { QueryClient } from "@tanstack/react-query"
import { getAutomationsAction } from "@/app/[locale]/settings/automations/actions"
import type {
  AutomationsQueryInput,
  AutomationsQueryResult,
} from "../types"

export async function automationsQueryFn(
  _input: AutomationsQueryInput,
  _queryClient?: QueryClient,
): Promise<AutomationsQueryResult> {
  return getAutomationsAction()
}

