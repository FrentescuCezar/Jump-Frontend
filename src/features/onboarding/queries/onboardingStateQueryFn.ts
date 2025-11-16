import { getOnboardingStateAction } from "@/app/[locale]/onboarding/actions"
import type { OnboardingState } from "../types"

export async function onboardingStateQueryFn(input: {
  locale: string
}): Promise<OnboardingState> {
  return getOnboardingStateAction({ locale: input.locale })
}

