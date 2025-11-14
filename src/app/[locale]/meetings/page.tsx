import { redirect } from "next/navigation"
import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { getSession } from "@/auth"
import { createQueryClient } from "@/lib/query/createQueryClient"
import { calendarEventsQuery } from "@/features/calendar/queries"
import MeetingsClient from "./components/MeetingsClient"

type MeetingsPageProps = {
  params: Promise<{ locale: string }>
}

export default async function MeetingsPage({ params }: MeetingsPageProps) {
  const [{ locale }, session] = await Promise.all([params, getSession()])

  if (!session?.user?.id) {
    redirect(`/${locale}/login`)
  }

  const queryClient = createQueryClient()
  await queryClient.prefetchQuery(
    calendarEventsQuery({ userId: session.user.id, locale }),
  )

  const state = dehydrate(queryClient)

  return (
    <HydrationBoundary state={state}>
      <MeetingsClient userId={session.user.id} locale={locale} />
    </HydrationBoundary>
  )
}
