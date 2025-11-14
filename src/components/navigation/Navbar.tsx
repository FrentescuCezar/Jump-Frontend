import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { getSession } from "@/auth"
import { LoginButton } from "@/components/auth/LoginButton"
import { LogoutButton } from "@/components/auth/LogoutButton"
import { env } from "@/config/env"
import { fetchNotifications } from "@/features/examples/chat/api"
import { NotificationBell } from "@/features/examples/chat/components/NotificationBell"
import { UserProfile } from "./UserProfile"

type NavbarProps = {
  locale: string
}

export async function Navbar({ locale }: NavbarProps) {
  const [session, tNav] = await Promise.all([
    getSession(),
    getTranslations("Navigation"),
  ])
  const notifications = session?.user?.id ? await fetchNotifications() : []
  const user = session?.user
  const keycloakBaseUrl = env.keycloak.baseUrl?.replace(/\/$/, "")
  const keycloakRealm = env.keycloak.realm
  const keycloakClientId = env.keycloak.clientId
  const keycloakLogoutUrl =
    keycloakBaseUrl && keycloakRealm
      ? `${keycloakBaseUrl}/realms/${keycloakRealm}/protocol/openid-connect/logout`
      : undefined

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <Link href={`/${locale}`} className="font-semibold">
          Jump
        </Link>
        <nav className="hidden items-center gap-4 text-sm font-medium text-muted-foreground md:flex">
          <Link
            href={`/${locale}`}
            className="transition hover:text-foreground"
          >
            {tNav("home")}
          </Link>
          <Link
            href={`/${locale}/examples/insights`}
            className="transition hover:text-foreground"
          >
            {tNav("examples")}
          </Link>
          <Link
            href={`/${locale}/meetings`}
            className="transition hover:text-foreground"
          >
            {tNav("meetings")}
          </Link>
          <Link
            href={`/${locale}/settings/integrations`}
            className="transition hover:text-foreground"
          >
            {tNav("settings")}
          </Link>
        </nav>

        {user ? (
          <div className="flex items-center gap-3">
            <NotificationBell initialNotifications={notifications} />
            <UserProfile user={user} />
            {keycloakLogoutUrl && keycloakClientId ? (
              <LogoutButton
                keycloakLogoutUrl={keycloakLogoutUrl}
                keycloakClientId={keycloakClientId}
                idToken={session?.tokens.idToken}
                redirectPath={`/${locale}`}
                label={tNav("logout")}
                size="sm"
                variant="outline"
              />
            ) : null}
          </div>
        ) : (
          <LoginButton size="sm" label={tNav("login")} />
        )}
      </div>
    </header>
  )
}
