"use client"

import { useQuery } from "@tanstack/react-query"
import { onboardingStateQuery } from "../queries"

export function useOnboardingState(input: { locale: string }) {
  return useQuery(onboardingStateQuery(input))
}

