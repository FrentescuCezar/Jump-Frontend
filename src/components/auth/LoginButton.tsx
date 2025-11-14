"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import type { ComponentProps } from "react"

interface LoginButtonProps extends ComponentProps<typeof Button> {
  label?: string
  callbackUrl?: string
}

export function LoginButton({
  label = "Login with Keycloak",
  callbackUrl = "/",
  ...props
}: LoginButtonProps) {
  return (
    <Button
      type="button"
      onClick={() => signIn("keycloak", { callbackUrl })}
      {...props}
    >
      {label}
    </Button>
  )
}
