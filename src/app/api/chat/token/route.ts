import { NextResponse } from "next/server"
import { requestChatToken } from "@/features/examples/chat/api"

export async function GET() {
  const token = await requestChatToken()
  return NextResponse.json({ token })
}
