import { authFetch } from "@/lib/authFetch"
import { env } from "@/config/env"
import type { ConnectedAccount } from "@/features/integrations/types"
import { ConnectedAccountsList } from "@/features/integrations/components/ConnectedAccountsList"
import { ConnectGoogleButton } from "@/features/integrations/components/ConnectGoogleButton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type SettingsIntegrationsPageProps = {
  params: Promise<{ locale: string }>
}

export default async function SettingsIntegrationsPage({
  params,
}: SettingsIntegrationsPageProps) {
  const { locale } = await params
  const accounts = await fetchAccounts()

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 lg:py-14">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-semibold">
            Calendar connections
          </CardTitle>
          <p className="text-muted-foreground">
            Connect Google accounts to sync all events and auto-schedule Recall
            bots.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <ConnectGoogleButton />
          <ConnectedAccountsList accounts={accounts} locale={locale} />
        </CardContent>
      </Card>
    </main>
  )
}

async function fetchAccounts(): Promise<ConnectedAccount[]> {
  if (!env.backendUrl) {
    return []
  }

  return authFetch<ConnectedAccount[]>(
    `${env.backendUrl}/integrations/connected-accounts`,
  )
}
