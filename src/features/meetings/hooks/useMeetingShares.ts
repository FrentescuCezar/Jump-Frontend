"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  listMeetingSharesAction,
  shareMeetingAction,
} from "@/app/[locale]/meetings/[id]/actions"
import { meetingSharesKey } from "../queries"

type UseMeetingSharesInput = {
  meetingId: string
  locale: string
  enabled?: boolean
}

export function useMeetingShares({
  meetingId,
  locale,
  enabled = true,
}: UseMeetingSharesInput) {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: meetingSharesKey(meetingId),
    queryFn: () => listMeetingSharesAction({ meetingId }),
    enabled: Boolean(meetingId) && enabled,
  })

  const mutation = useMutation({
    mutationFn: (email: string) =>
      shareMeetingAction({ meetingId, email, locale }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: meetingSharesKey(meetingId),
      })
    },
  })

  return {
    query,
    shares: query.data,
    addShare: mutation.mutateAsync,
    adding: mutation.isPending,
    error: mutation.error,
  }
}

