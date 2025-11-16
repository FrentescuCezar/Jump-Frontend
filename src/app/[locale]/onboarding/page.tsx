import { redirect } from "next/navigation"
import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { getSession } from "@/auth"
import { createQueryClient } from "@/lib/query/createQueryClient"
import { onboardingStateKey } from "@/features/onboarding/queries"
import { fetchOnboardingState } from "@/features/onboarding/api"
import OnboardingClient from "./components/OnboardingClient"

type OnboardingPageProps = {
  params: Promise<{ locale: string }>
}

export default async function OnboardingPage({ params }: OnboardingPageProps) {
  const [{ locale }, session] = await Promise.all([params, getSession()])

  if (!session?.user?.id) {
    redirect(`/${locale}/signup`)
  }

  const queryClient = createQueryClient()
  const onboardingState = await fetchOnboardingState()

  if (onboardingState.isComplete && onboardingState.hasGoogleCalendar) {
    redirect(`/${locale}/meetings`)
  }

  queryClient.setQueryData(onboardingStateKey({ locale }), onboardingState)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OnboardingClient locale={locale} />
    </HydrationBoundary>
  )
}
