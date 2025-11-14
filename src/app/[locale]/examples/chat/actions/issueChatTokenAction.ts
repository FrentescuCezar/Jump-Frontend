"use server"

import { requestChatToken } from "@/features/examples/chat/api"

export async function issueChatTokenAction() {
  return requestChatToken()
}
