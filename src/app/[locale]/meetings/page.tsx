import { redirect } from "next/navigation"
import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { getSession } from "@/auth"
import { createQueryClient } from "@/lib/query/createQueryClient"
import { calendarEventsQuery } from "@/features/calendar/queries"
import { connectedAccountsQuery } from "@/features/integrations/queries"
import MeetingsClient from "./components/MeetingsClient"
import { fetchOnboardingState } from "@/features/onboarding/api"

type MeetingsPageProps = {
  params: Promise<{ locale: string }>
}

export default async function MeetingsPage({ params }: MeetingsPageProps) {
  const [{ locale }, session] = await Promise.all([params, getSession()])

  if (!session?.user?.id) {
    redirect(`/${locale}/signup`)
  }

  const onboardingState = await fetchOnboardingState()
  if (!onboardingState.hasGoogleCalendar) {
    redirect(`/${locale}/onboarding`)
  }

  const queryClient = createQueryClient()
  await Promise.all([
    queryClient.prefetchQuery(
      calendarEventsQuery({
        userId: session.user.id,
        locale,
        window: "upcoming",
      }),
    ),
    queryClient.prefetchQuery(
      calendarEventsQuery({
        userId: session.user.id,
        locale,
        window: "past",
      }),
    ),
    queryClient.prefetchQuery(connectedAccountsQuery()),
  ])

  const state = dehydrate(queryClient)

  return (
    <HydrationBoundary state={state}>
      <MeetingsClient userId={session.user.id} locale={locale} />
    </HydrationBoundary>
  )
}
