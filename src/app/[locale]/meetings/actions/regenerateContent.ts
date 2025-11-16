"use server"

import { revalidatePath } from "next/cache"
import { regenerateMeetingContent } from "@/features/meetings/api"

type RegenerateContentInput = {
  meetingId: string
  locale: string
  contentType: "email" | "summary" | "linkedin" | "facebook"
}

export async function regenerateContentAction(input: RegenerateContentInput) {
  // For now, we'll use the existing regenerateMeetingContent API
  // In the future, this can be enhanced to regenerate specific content types
  await regenerateMeetingContent(input.meetingId)
  revalidatePath(`/${input.locale}/meetings/${input.meetingId}`)
  revalidatePath(`/${input.locale}/meetings`)
}


