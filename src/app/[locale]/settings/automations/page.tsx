import { redirect } from "next/navigation"
import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { getSession } from "@/auth"
import { createQueryClient } from "@/lib/query/createQueryClient"
import { automationsQuery } from "@/features/automations/queries"
import { AutomationsClient } from "./components/AutomationsClient"

type AutomationsPageProps = {
  params: Promise<{ locale: string }>
}

export default async function AutomationsPage({
  params,
}: AutomationsPageProps) {
  const [{ locale }, session] = await Promise.all([params, getSession()])

  if (!session?.user?.id) {
    redirect(`/${locale}/signup`)
  }

  const queryClient = createQueryClient()
  await queryClient.prefetchQuery(automationsQuery({ locale }))

  const state = dehydrate(queryClient)

  return (
    <main className="p-0">
      <HydrationBoundary state={state}>
        <AutomationsClient locale={locale} />
      </HydrationBoundary>
    </main>
  )
}

