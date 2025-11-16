import { NextResponse } from "next/server"
import { getSession } from "@/auth"
import { fetchCalendarEvents } from "@/features/calendar/api"

export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await fetchCalendarEvents("upcoming")
  return NextResponse.json(data)
}

