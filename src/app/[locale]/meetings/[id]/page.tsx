import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { getSession } from "@/auth"
import { createQueryClient } from "@/lib/query/createQueryClient"
import { meetingActivityQuery } from "@/features/meetings/queries"
import { connectedAccountsQuery } from "@/features/integrations/queries"
import MeetingActivityClient from "./components/MeetingActivityClient"
import { ApiError } from "@/lib/forms/apiError"

type MeetingDetailsPageProps = {
  params: Promise<{ locale: string; id: string }>
}

export default async function MeetingDetailsPage({
  params,
}: MeetingDetailsPageProps) {
  const [{ locale, id }, session] = await Promise.all([params, getSession()])

  const queryClient = createQueryClient()
  let initialAccess: "authorized" | "unauthenticated" | "forbidden" | "idle" =
    "idle"

  if (session?.user?.id) {
    try {
      await Promise.all([
        queryClient.prefetchQuery(
          meetingActivityQuery({
            meetingId: id,
            viewerId: session.user.id,
          }),
        ),
        queryClient.prefetchQuery(connectedAccountsQuery()),
      ])
      initialAccess = "authorized"
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        initialAccess = "forbidden"
      } else if (error instanceof ApiError && error.status === 401) {
        initialAccess = "unauthenticated"
      } else {
        throw error
      }
    }
  } else {
    initialAccess = "unauthenticated"
  }

  const state = dehydrate(queryClient)

  return (
    <HydrationBoundary state={state}>
      <MeetingActivityClient
        meetingId={id}
        locale={locale}
        viewer={{
          id: session?.user?.id ?? null,
          email: session?.user?.email ?? null,
          name: session?.user?.name ?? null,
          initialAccess,
        }}
      />
    </HydrationBoundary>
  )
}

