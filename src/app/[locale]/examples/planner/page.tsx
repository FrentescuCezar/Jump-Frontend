import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { formatISO, startOfMonth, endOfMonth } from "date-fns"
import { redirect } from "next/navigation"
import { getSession } from "@/auth"
import { createQueryClient } from "@/lib/query/createQueryClient"
import {
  plannerEntriesQuery,
  plannerProjectsQuery,
} from "@/features/examples/planner/queries"
import PlannerClient from "./components/PlannerClient"

type PlannerPageProps = {
  params: Promise<{ locale: string }>
}

export default async function PlannerPage({ params }: PlannerPageProps) {
  const [session, { locale }] = await Promise.all([getSession(), params])

  if (!session?.user?.id) {
    redirect(`/${locale}/login`)
  }

  const today = new Date()
  const range = {
    userId: session.user.id!,
    start: formatISO(startOfMonth(today), { representation: "date" }),
    end: formatISO(endOfMonth(today), { representation: "date" }),
  }

  const queryClient = createQueryClient()
  await Promise.all([
    queryClient.prefetchQuery(plannerEntriesQuery(range)),
    queryClient.prefetchQuery(plannerProjectsQuery()),
  ])

  const state = dehydrate(queryClient)

  return (
    <HydrationBoundary state={state}>
      <PlannerClient initialRange={range} />
    </HydrationBoundary>
  )
}

