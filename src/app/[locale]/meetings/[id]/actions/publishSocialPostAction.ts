"use server"

import { revalidatePath } from "next/cache"
import { publishSocialPost } from "@/features/meetings/api"

type PublishSocialPostActionInput = {
  postId: string
  meetingId: string
  locale: string
}

export async function publishSocialPostAction(
  input: PublishSocialPostActionInput,
) {
  await publishSocialPost(input.postId)
  revalidatePath(`/${input.locale}/meetings/${input.meetingId}`)
}

