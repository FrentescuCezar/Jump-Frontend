"use server"

import { revalidatePath } from "next/cache"
import { regenerateMeetingContent } from "@/features/meetings/api"

type RegenerateMeetingActionInput = {
  meetingId: string
  locale: string
}

export async function regenerateMeetingAction(
  input: RegenerateMeetingActionInput,
) {
  await regenerateMeetingContent(input.meetingId)
  revalidatePath(`/${input.locale}/meetings/${input.meetingId}`)
}
