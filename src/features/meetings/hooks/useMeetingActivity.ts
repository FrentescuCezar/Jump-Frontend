"use client"

import { useQuery } from "@tanstack/react-query"
import { ApiError } from "@/lib/forms/apiError"
import { meetingActivityQuery } from "../queries"
import type { MeetingActivityQueryInput } from "../types"

type UseMeetingActivityInput = MeetingActivityQueryInput & {
  enabled?: boolean
}

export function useMeetingActivity(input: UseMeetingActivityInput) {
  const query = useQuery({
    ...meetingActivityQuery(input),
    enabled: Boolean(input.meetingId) && (input.enabled ?? true),
    retry(failureCount, error) {
      if (error instanceof ApiError && [401, 403].includes(error.status)) {
        return false
      }
      return failureCount < 2
    },
  })

  return {
    query,
    activity: query.data,
  }
}

