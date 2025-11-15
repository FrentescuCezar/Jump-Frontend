import { redirect } from "next/navigation"
import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { getSession } from "@/auth"
import { createQueryClient } from "@/lib/query/createQueryClient"
import { meetingDetailsQuery } from "@/features/meetings/queries"
import MeetingDetailsClient from "./components/MeetingDetailsClient"

type MeetingDetailsPageProps = {
  params: Promise<{ locale: string; id: string }>
}

export default async function MeetingDetailsPage({
  params,
}: MeetingDetailsPageProps) {
  const [{ locale, id }, session] = await Promise.all([params, getSession()])

  if (!session?.user?.id) {
    redirect(`/${locale}/login`)
  }

  const queryClient = createQueryClient()
  await queryClient.prefetchQuery(
    meetingDetailsQuery({
      meetingId: id,
      userId: session.user.id,
      locale,
    }),
  )

  const state = dehydrate(queryClient)

  return (
    <HydrationBoundary state={state}>
      <MeetingDetailsClient meetingId={id} userId={session.user.id} locale={locale} />
    </HydrationBoundary>
  )
}

