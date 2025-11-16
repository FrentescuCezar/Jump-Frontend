"use server"

import { updateOnboardingPreferences } from "@/features/onboarding/api"
import type { UpdateOnboardingPreferencesInput } from "@/features/onboarding/types"

type UpdateOnboardingPreferencesActionInput = UpdateOnboardingPreferencesInput & {
  locale: string
}

export async function updateOnboardingPreferencesAction(
  input: UpdateOnboardingPreferencesActionInput,
) {
  const { locale: _locale, ...preferences } = input
  return updateOnboardingPreferences(preferences)
}

