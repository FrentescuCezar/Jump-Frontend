"use server"

import { revalidatePath } from "next/cache"
import { createMeetingShare } from "@/features/meetings/api"

type ShareMeetingActionInput = {
  meetingId: string
  email: string
  locale?: string
}

export async function shareMeetingAction(input: ShareMeetingActionInput) {
  const share = await createMeetingShare(input.meetingId, {
    email: input.email,
  })

  if (input.locale) {
    revalidatePath(`/${input.locale}/meetings/${input.meetingId}`)
  }

  return share
}

