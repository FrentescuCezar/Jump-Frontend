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
    redirect(`/${locale}/login`)
  }

  const queryClient = createQueryClient()
  await queryClient.prefetchQuery(automationsQuery({ locale }))

  const state = dehydrate(queryClient)

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 lg:py-14">
      <div className="mb-6 flex flex-col gap-2">
        <p className="text-sm text-primary">AI automations</p>
        <h1 className="text-3xl font-semibold">Automation builder</h1>
        <p className="text-sm text-muted-foreground">
          Control how Jump drafts follow-ups for each social channel.
        </p>
      </div>
      <HydrationBoundary state={state}>
        <AutomationsClient locale={locale} />
      </HydrationBoundary>
    </main>
  )
}

