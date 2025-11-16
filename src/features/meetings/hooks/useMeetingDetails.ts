"use client"

import { useQuery } from "@tanstack/react-query"
import { meetingDetailsQuery } from "../queries"
import type { MeetingDetailsQueryInput } from "../types"

export function useMeetingDetails(input: MeetingDetailsQueryInput) {
  const query = useQuery({
    ...meetingDetailsQuery(input),
    enabled: Boolean(input.meetingId),
  })

  return {
    query,
    details: query.data,
  }
}
