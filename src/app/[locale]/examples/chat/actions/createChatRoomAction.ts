"use server"

import { getTranslations } from "next-intl/server"
import { postCreateChatRoom } from "../fetches/postCreateChatRoom"
import { CreateChatRoomSchema } from "@/schemas/examples/create-chat-room"
import { validateWithZod, success, failure, Val, Res } from "@/lib/forms"

export async function createChatRoomAction(
  _prev: Res<typeof CreateChatRoomSchema>,
  values: Val<typeof CreateChatRoomSchema>,
): Promise<Res<typeof CreateChatRoomSchema>> {
  const tGlobal = await getTranslations()
  const tForm = await getTranslations("Examples.Chat.sidebar")

  const validation = validateWithZod(
    CreateChatRoomSchema,
    values,
    tGlobal,
    tForm,
  )
  if (!validation.ok) return validation

  try {
    await postCreateChatRoom({
      name: validation.data.name,
      description: validation.data.description,
      theme: validation.data.theme,
      participants: [], // Public room - anyone can join
    })

    return success(values)
  } catch (error) {
    return failure(error, tGlobal, tForm, values)
  }
}


