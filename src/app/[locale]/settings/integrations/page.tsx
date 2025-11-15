import { authFetch } from "@/lib/authFetch"
import { env } from "@/config/env"
import type { ConnectedAccount } from "@/features/integrations/types"
import Link from "next/link"
import { ConnectedAccountsList } from "@/features/integrations/components/ConnectedAccountsList"
import { ConnectGoogleButton } from "@/features/integrations/components/ConnectGoogleButton"
import { ConnectLinkedInButton } from "@/features/integrations/components/ConnectLinkedInButton"
import { ConnectFacebookButton } from "@/features/integrations/components/ConnectFacebookButton"
import { MeetingPreferencesForm } from "@/features/meetings/components/MeetingPreferencesForm"
import { fetchMeetingPreference } from "@/features/meetings/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type SettingsIntegrationsPageProps = {
  params: Promise<{ locale: string }>
}

export default async function SettingsIntegrationsPage({
  params,
}: SettingsIntegrationsPageProps) {
  const { locale } = await params
  const accounts = await fetchAccounts()
  const preference = await fetchMeetingPreference()

  const calendarAccounts = accounts.filter(
    (account) => account.provider === "GOOGLE_CALENDAR",
  )
  const socialAccounts = accounts.filter(
    (account) => account.provider !== "GOOGLE_CALENDAR",
  )

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
          <ConnectedAccountsList
            accounts={calendarAccounts}
            locale={locale}
            emptyDescription="Connect Google Calendar to sync meetings and automate Recall bots."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-semibold">
            Social publishing
          </CardTitle>
          <p className="text-muted-foreground">
            Connect LinkedIn or Facebook Pages to enable one-click posting from
            Jump.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <ConnectLinkedInButton />
            <ConnectFacebookButton />
          </div>
          <ConnectedAccountsList
            accounts={socialAccounts}
            locale={locale}
            emptyTitle="No social accounts yet"
            emptyDescription="Add LinkedIn or Facebook to publish AI drafts directly."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-semibold">
            Recall bot lead time
          </CardTitle>
          <p className="text-muted-foreground">
            Control how early the Recall.ai bot joins each meeting.
          </p>
        </CardHeader>
        <CardContent>
          <MeetingPreferencesForm
            locale={locale}
            initialLeadMinutes={preference.leadMinutes}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-semibold">
            Automations
          </CardTitle>
          <p className="text-muted-foreground">
            Configure channel-specific prompts that turn transcripts into
            publish-ready content.
          </p>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href={`/${locale}/settings/automations`}>
              Open automations builder
            </Link>
          </Button>
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
