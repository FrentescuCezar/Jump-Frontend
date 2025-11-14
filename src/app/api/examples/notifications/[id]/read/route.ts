import { NextResponse } from "next/server"
import { markNotificationRead } from "@/features/examples/chat/api"

type RouteProps = {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, { params }: RouteProps) {
  const { id } = await params
  await markNotificationRead(id)
  return NextResponse.json({ ok: true })
}

