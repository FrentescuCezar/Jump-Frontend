import { getSession } from "@/auth"
import { env } from "@/config/env"
import { fetchNotifications } from "@/features/examples/chat/api"
import { NavbarClient } from "./NavbarClient"

type NavbarProps = {
  locale: string
}

export async function Navbar({ locale }: NavbarProps) {
  const session = await getSession()
  // Only fetch notifications if session is valid and has no errors
  const notifications =
    session?.user?.id && !session?.error ? await fetchNotifications() : []
  const user = session?.user
  const keycloakBaseUrl = env.keycloak.baseUrl?.replace(/\/$/, "")
  const keycloakRealm = env.keycloak.realm
  const keycloakClientId = env.keycloak.clientId
  const keycloakLogoutUrl =
    keycloakBaseUrl && keycloakRealm
      ? `${keycloakBaseUrl}/realms/${keycloakRealm}/protocol/openid-connect/logout`
      : undefined

  return (
    <NavbarClient
      locale={locale}
      user={user}
      notifications={notifications}
      keycloakLogoutUrl={keycloakLogoutUrl}
      keycloakClientId={keycloakClientId}
      idToken={session?.tokens.idToken}
    />
  )
}
