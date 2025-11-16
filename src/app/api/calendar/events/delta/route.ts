import { NextResponse } from "next/server"
import { getSession } from "@/auth"
import { fetchCalendarEventsDelta } from "@/features/calendar/api"

export async function GET(request: Request) {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(request.url)
  const updatedSince = url.searchParams.get("updatedSince")

  if (!updatedSince) {
    return NextResponse.json(
      { error: "Missing updatedSince parameter" },
      { status: 400 },
    )
  }

  const data = await fetchCalendarEventsDelta(updatedSince)
  return NextResponse.json(data)
}


