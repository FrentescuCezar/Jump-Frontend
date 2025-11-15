"use server"

import { revalidatePath } from "next/cache"
import { saveAutomation } from "@/features/automations/api"

type SaveAutomationActionInput = {
  id?: string
  name: string
  channel: string
  promptTemplate: string
  isEnabled: boolean
  locale: string
}

export async function saveAutomationAction(input: SaveAutomationActionInput) {
  const automation = await saveAutomation({
    id: input.id,
    name: input.name,
    channel: input.channel,
    promptTemplate: input.promptTemplate,
    isEnabled: input.isEnabled,
  })

  revalidatePath(`/${input.locale}/settings/automations`)

  return automation
}

