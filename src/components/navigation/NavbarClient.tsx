"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/components/auth/LogoutButton"
import { NotificationBell } from "@/features/examples/chat/components/NotificationBell"
import { UserProfile } from "./UserProfile"
import type { AppUser } from "@/lib/auth/types"
import type { ChatNotification } from "@/schemas/examples/chat"

import { useTranslations } from "next-intl"

type NavbarClientProps = {
  locale: string
  user?: AppUser
  notifications: ChatNotification[]
  keycloakLogoutUrl?: string
  keycloakClientId?: string
  idToken?: string
}

export function NavbarClient({
  locale,
  user,
  notifications,
  keycloakLogoutUrl,
  keycloakClientId,
  idToken,
}: NavbarClientProps) {
  const tNav = useTranslations("Navigation")
  const signupPath = `/${locale}/signup`
  const resolveHref = (path: string) => (user ? path : signupPath)
  return (
    <motion.header
      className="relative z-50 border-b border-white/10 bg-gradient-to-br from-[#0a0118] via-[#1a0a2e] to-[#0f0520]"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 lg:px-12">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 text-2xl font-bold text-white"
        >
          <motion.div
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Calendar className="w-5 h-5 text-white" />
          </motion.div>
          Jump
        </Link>

        {/* Navigation Links */}
        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          <Link
            href={`/${locale}`}
            className="text-gray-300 transition-colors hover:text-purple-400"
          >
            {tNav("home")}
          </Link>
          <Link
            href={resolveHref(`/${locale}/meetings`)}
            className="text-gray-300 transition-colors hover:text-purple-400"
          >
            {tNav("meetings")}
          </Link>
          <Link
            href={resolveHref(`/${locale}/examples/insights`)}
            className="text-gray-300 transition-colors hover:text-purple-400"
          >
            {tNav("examples")}
          </Link>
          <Link
            href={resolveHref(`/${locale}/settings/integrations`)}
            className="text-gray-300 transition-colors hover:text-purple-400"
          >
            {tNav("settings")}
          </Link>
        </nav>

        {/* Right Side - User Actions */}
        {user ? (
          <div className="flex items-center gap-3">
            <NotificationBell
              initialNotifications={notifications}
              locale={locale}
            />
            <UserProfile user={user} />
            {keycloakLogoutUrl && keycloakClientId ? (
              <LogoutButton
                keycloakLogoutUrl={keycloakLogoutUrl}
                keycloakClientId={keycloakClientId}
                idToken={idToken}
                redirectPath={`/${locale}`}
                label={tNav("logout")}
                size="sm"
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10"
              />
            ) : null}
          </div>
        ) : (
          <Button
            size="sm"
            className="border-white/20 bg-white/5 text-white hover:bg-white/10"
            asChild
          >
            <Link href={signupPath}>{tNav("login")}</Link>
          </Button>
        )}
      </div>
    </motion.header>
  )
}
