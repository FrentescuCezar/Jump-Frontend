"use server"

import { revalidatePath } from "next/cache"
import { updateMeetingPreference } from "@/features/meetings/api"

type UpdateMeetingPreferenceActionInput = {
  leadMinutes: number
  locale: string
}

export async function updateMeetingPreferenceAction(
  input: UpdateMeetingPreferenceActionInput,
) {
  const preference = await updateMeetingPreference({
    leadMinutes: input.leadMinutes,
  })

  revalidatePath(`/${input.locale}/settings/integrations`)

  return preference
}

