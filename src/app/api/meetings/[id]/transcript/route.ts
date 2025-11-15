"use server"

import { NextResponse } from "next/server"
import { env } from "@/config/env"
import { authFetch } from "@/lib/authFetch"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_: Request, context: RouteContext) {
  if (!env.backendUrl) {
    return NextResponse.json(
      { error: "Backend URL not configured" },
      { status: 500 },
    )
  }

  const { id } = await context.params

  try {
    const transcript = await authFetch<unknown>(
      `${env.backendUrl}/meetings/${id}/media/transcript`,
    )
    return NextResponse.json({ transcript })
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to load transcript" },
      { status: 500 },
    )
  }
}
