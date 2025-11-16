import type { QueryClient } from "@tanstack/react-query"
import { getMeetingActivityAction } from "@/app/[locale]/meetings/[id]/actions"
import type {
  MeetingActivityQueryInput,
  MeetingActivityQueryResult,
} from "../types"

export async function meetingActivityQueryFn(
  input: MeetingActivityQueryInput,
  _queryClient?: QueryClient,
): Promise<MeetingActivityQueryResult> {
  return getMeetingActivityAction({ meetingId: input.meetingId })
}

