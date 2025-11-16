import { NextResponse } from "next/server"
import { getSession } from "@/auth"
import { updateOnboardingPreferences } from "@/features/onboarding/api"
import type { UpdateOnboardingPreferencesInput } from "@/features/onboarding/types"

export async function PUT(request: Request) {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json()) as UpdateOnboardingPreferencesInput
  const data = await updateOnboardingPreferences(body)
  return NextResponse.json(data)
}

