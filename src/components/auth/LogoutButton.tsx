"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import type { ComponentProps } from "react"

type LogoutButtonProps = ComponentProps<typeof Button> & {
  keycloakLogoutUrl: string
  keycloakClientId: string
  idToken?: string
  redirectPath?: string
  label?: string
}

export function LogoutButton({
  keycloakLogoutUrl,
  keycloakClientId,
  idToken,
  redirectPath = "/",
  label = "Logout",
  disabled,
  variant = "outline",
  size = "sm",
  ...rest
}: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const buildRedirectUrl = () => {
    if (redirectPath.startsWith("http://") || redirectPath.startsWith("https://")) {
      return redirectPath
    }
    if (typeof window === "undefined") {
      return redirectPath
    }
    return new URL(redirectPath, window.location.origin).toString()
  }

  const handleLogout = async () => {
    if (isLoggingOut) {
      return
    }

    setIsLoggingOut(true)

    try {
      await signOut({ redirect: false })
    } catch (error) {
      console.error("Failed to clear NextAuth session before Keycloak logout", error)
    }

    try {
      const logoutUrl = new URL(keycloakLogoutUrl)
      logoutUrl.searchParams.set("client_id", keycloakClientId)

      const redirectUrl = buildRedirectUrl()
      if (redirectUrl) {
        logoutUrl.searchParams.set("post_logout_redirect_uri", redirectUrl)
      }

      if (idToken) {
        logoutUrl.searchParams.set("id_token_hint", idToken)
      }

      window.location.href = logoutUrl.toString()
    } catch (error) {
      console.error("Failed to redirect to Keycloak logout endpoint", error)
      const fallback = buildRedirectUrl()
      window.location.href = fallback
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={disabled || isLoggingOut}
      {...rest}
    >
      {isLoggingOut ? "Logging out..." : label}
    </Button>
  )
}

