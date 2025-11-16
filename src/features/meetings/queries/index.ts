import type { QueryClient } from "@tanstack/react-query"
import type { MeetingDetailsQueryInput } from "../types"
import { meetingDetailsQueryFn } from "./meetingDetailsQueryFn"
import {
  meetingDetailsKey,
  meetingActivityKey,
  meetingSharesKey,
} from "./keys"
import { meetingDetailsQueryConfig } from "./config"
import { meetingActivityQueryFn } from "./meetingActivityQueryFn"

export { meetingDetailsKey, meetingActivityKey, meetingSharesKey } from "./keys"

export const meetingDetailsQuery = (
  input: MeetingDetailsQueryInput,
  queryClient?: QueryClient,
) => ({
  queryKey: meetingDetailsKey(input),
  queryFn: () => meetingDetailsQueryFn(input, queryClient),
  ...meetingDetailsQueryConfig,
})

export const meetingActivityQuery = (
  input: MeetingActivityQueryInput,
  queryClient?: QueryClient,
) => ({
  queryKey: meetingActivityKey(input),
  queryFn: () => meetingActivityQueryFn(input, queryClient),
  ...meetingDetailsQueryConfig,
})

