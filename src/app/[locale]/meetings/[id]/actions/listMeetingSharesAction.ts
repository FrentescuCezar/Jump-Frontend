"use server"

import { fetchMeetingShares } from "@/features/meetings/api"

type ListMeetingSharesInput = {
  meetingId: string
}

export async function listMeetingSharesAction(
  input: ListMeetingSharesInput,
) {
  return fetchMeetingShares(input.meetingId)
}

