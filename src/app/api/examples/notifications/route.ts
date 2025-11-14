import { NextResponse } from "next/server"
import { fetchNotifications } from "@/features/examples/chat/api"

export async function GET() {
  const notifications = await fetchNotifications()
  return NextResponse.json(notifications)
}

