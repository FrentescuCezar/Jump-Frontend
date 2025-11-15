"use server"

import { NextResponse } from "next/server"
import { authFetch } from "@/lib/authFetch"
import { env } from "@/config/env"

export async function GET() {
  if (!env.backendUrl) {
    return NextResponse.json(
      { error: "Backend URL not configured" },
      { status: 500 },
    )
  }

  const result = await authFetch<{ url: string }>(
    `${env.backendUrl}/integrations/linkedin/oauth/url`,
  )

  return NextResponse.json(result)
}

