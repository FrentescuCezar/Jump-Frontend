import type { QueryClient } from "@tanstack/react-query"
import { getMeetingDetailsAction } from "@/app/[locale]/meetings/[id]/actions"
import type { MeetingDetailsQueryInput, MeetingDetailsQueryResult } from "../types"

export async function meetingDetailsQueryFn(
  input: MeetingDetailsQueryInput,
  _queryClient?: QueryClient,
): Promise<MeetingDetailsQueryResult> {
  return getMeetingDetailsAction({ meetingId: input.meetingId })
}

