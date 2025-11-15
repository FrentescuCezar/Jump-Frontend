import type { QueryClient } from "@tanstack/react-query"
import type { MeetingDetailsQueryInput } from "../types"
import { meetingDetailsQueryFn } from "./meetingDetailsQueryFn"
import { meetingDetailsKey } from "./keys"
import { meetingDetailsQueryConfig } from "./config"

export { meetingDetailsKey } from "./keys"

export const meetingDetailsQuery = (
  input: MeetingDetailsQueryInput,
  queryClient?: QueryClient,
) => ({
  queryKey: meetingDetailsKey(input),
  queryFn: () => meetingDetailsQueryFn(input, queryClient),
  ...meetingDetailsQueryConfig,
})

