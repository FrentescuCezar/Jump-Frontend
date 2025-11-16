import { getSession } from "@/auth"
import { env } from "@/config/env"
import { fetchNotifications } from "@/features/examples/chat/api"
import { NavbarClient } from "./NavbarClient"

type NavbarProps = {
  locale: string
}

export async function Navbar({ locale }: NavbarProps) {
  let session
  let user
  let notifications: Awaited<ReturnType<typeof fetchNotifications>> = []
  let idToken: string | undefined

  try {
    session = await getSession()
    
    // If session has an error (e.g., RefreshAccessTokenError), treat as unauthenticated
    if (session?.error) {
      session = null
      user = undefined
    } else {
      user = session?.user
      idToken = session?.tokens.idToken
      
      // Only fetch notifications if user is authenticated and session is valid
      if (user?.id) {
        try {
          notifications = await fetchNotifications()
        } catch (error) {
          // fetchNotifications already handles errors gracefully, but catch here as extra safety
          console.error("Failed to fetch notifications in Navbar:", error)
          notifications = []
        }
      }
    }
  } catch (error) {
    // If getSession() fails (e.g., server unavailable, auth service down), treat as unauthenticated
    console.error("Failed to get session in Navbar:", error)
    session = null
    user = undefined
    notifications = []
  }

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
      idToken={idToken}
    />
  )
}
