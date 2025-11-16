import { NextResponse } from "next/server"
import { getSession } from "@/auth"
import { fetchOnboardingState } from "@/features/onboarding/api"

export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await fetchOnboardingState()
  return NextResponse.json(data)
}

