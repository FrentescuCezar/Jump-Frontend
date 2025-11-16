"use server"

import { fetchOnboardingState } from "@/features/onboarding/api"
import type { OnboardingState } from "@/features/onboarding/types"

type GetOnboardingStateActionInput = {
  locale: string
}

export async function getOnboardingStateAction(
  _input: GetOnboardingStateActionInput,
): Promise<OnboardingState> {
  return fetchOnboardingState()
}

