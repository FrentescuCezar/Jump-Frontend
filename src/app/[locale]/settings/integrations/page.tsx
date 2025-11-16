import { authFetch } from "@/lib/authFetch"
import { env } from "@/config/env"
import type { ConnectedAccount } from "@/features/integrations/types"
import { fetchMeetingPreference } from "@/features/meetings/api"
import { SettingsExperience } from "../components/SettingsExperience"

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
    <SettingsExperience
      locale={locale}
      calendarAccounts={calendarAccounts}
      socialAccounts={socialAccounts}
      leadMinutes={preference.leadMinutes}
    />
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
