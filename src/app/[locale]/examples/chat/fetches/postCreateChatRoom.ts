"use server"

import { env } from "@/config/env"
import { authFetch } from "@/lib/authFetch"
import { ChatRoomSchema } from "@/schemas/examples/chat"

/**
 * DTO for chat room creation request
 */
export interface CreateChatRoomDTO {
  name: string
  description: string
  theme?: string
  participants?: string[]
}

/**
 * POST /examples/chat/rooms
 * Creates a new chat room.
 */
export async function postCreateChatRoom(
  dto: CreateChatRoomDTO,
): Promise<ReturnType<typeof ChatRoomSchema.parse>> {
  const response = await authFetch<unknown>(
    `${env.backendUrl}/examples/chat/rooms`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    },
  )
  return ChatRoomSchema.parse(response)
}


