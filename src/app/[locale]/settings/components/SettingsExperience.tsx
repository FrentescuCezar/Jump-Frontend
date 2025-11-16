"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { toast } from "react-toastify"
import {
  ArrowRight,
  Bot,
  Facebook,
  Linkedin,
  Plus,
  Settings as SettingsIcon,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import type { ConnectedAccount } from "@/features/integrations/types"
import { disconnectAccountAction } from "@/features/integrations/actions/disconnectAccountAction"
import { syncCalendarNowAction } from "@/features/calendar/actions/syncCalendarNowAction"
import { updateMeetingPreferenceAction } from "@/app/[locale]/settings/integrations/actions"

type SettingsExperienceProps = {
  locale: string
  calendarAccounts: ConnectedAccount[]
  socialAccounts: ConnectedAccount[]
  leadMinutes: number
}

type AccountMetadata = {
  email?: string
  name?: string
  pageName?: string
  localizedFirstName?: string
  localizedLastName?: string
} | null

type OAuthProvider = "google" | "linkedin" | "facebook"

const COLOR_PALETTE = ["#8B5CF6", "#06B6D4", "#EC4899", "#F59E0B", "#10B981"]

const providerLabels: Record<OAuthProvider, string> = {
  google: "Google Calendar",
  linkedin: "LinkedIn",
  facebook: "Facebook",
}

const oauthEndpoints: Record<OAuthProvider, string> = {
  google: "/api/integrations/google/oauth/url",
  linkedin: "/api/integrations/linkedin/oauth/url",
  facebook: "/api/integrations/facebook/oauth/url",
}

function formatTimestamp(value?: string | null) {
  if (!value) return "Not synced yet"
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value))
  } catch {
    return value
  }
}

function getAccountTitle(account: ConnectedAccount) {
  const metadata = account.metadata as AccountMetadata
  const fallbackName =
    [metadata?.localizedFirstName, metadata?.localizedLastName]
      .filter(Boolean)
      .join(" ") || undefined

  return (
    metadata?.email ??
    metadata?.name ??
    metadata?.pageName ??
    fallbackName ??
    account.label ??
    account.provider
  )
}

export function SettingsExperience({
  locale,
  calendarAccounts,
  socialAccounts,
  leadMinutes,
}: SettingsExperienceProps) {
  const router = useRouter()
  const [botLeadTime, setBotLeadTime] = useState<[number]>([leadMinutes])
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null)
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null)
  const [syncingAccountId, setSyncingAccountId] = useState<string | null>(null)
  const [isSavingLeadTime, startLeadTimeTransition] = useTransition()
  const [isDisconnecting, startDisconnectTransition] = useTransition()
  const [isSyncing, startSyncTransition] = useTransition()

  const linkedInAccounts = useMemo(
    () => socialAccounts.filter((account) => account.provider === "LINKEDIN"),
    [socialAccounts],
  )

  const facebookAccounts = useMemo(
    () => socialAccounts.filter((account) => account.provider === "FACEBOOK"),
    [socialAccounts],
  )

  const handleOAuthStart = async (provider: OAuthProvider) => {
    try {
      setOauthLoading(provider)
      const response = await fetch(oauthEndpoints[provider], {
        credentials: "include",
      })
      const data = (await response.json()) as { url?: string }
      if (data.url) {
        window.location.href = data.url
        return
      }
      throw new Error("Missing redirect URL")
    } catch (error) {
      console.error(error)
      toast.error(`Unable to open ${providerLabels[provider]}`)
    } finally {
      setOauthLoading(null)
    }
  }

  const handleDisconnect = (accountId: string) => {
    setActiveAccountId(accountId)
    startDisconnectTransition(async () => {
      try {
        await disconnectAccountAction({ accountId, locale })
        toast.success("Disconnected successfully")
        router.refresh()
      } catch (error) {
        console.error(error)
        toast.error("Failed to disconnect account")
      } finally {
        setActiveAccountId(null)
      }
    })
  }

  const handleSync = (accountId: string) => {
    setSyncingAccountId(accountId)
    startSyncTransition(async () => {
      try {
        const summary = await syncCalendarNowAction()
        if (summary.success) {
          toast.success(
            `Synced ${summary.syncedAccounts}/${summary.totalAccounts} calendars`,
          )
        } else {
          toast.error("Sync completed with errors")
        }
        router.refresh()
      } catch (error) {
        console.error(error)
        toast.error("Failed to start sync")
      } finally {
        setSyncingAccountId(null)
      }
    })
  }

  const handleLeadTimeSave = () => {
    const [value] = botLeadTime
    startLeadTimeTransition(async () => {
      try {
        await updateMeetingPreferenceAction({
          leadMinutes: value,
          locale,
        })
        toast.success("Lead time updated")
        router.refresh()
      } catch (error) {
        console.error(error)
        toast.error("Unable to update lead time")
      }
    })
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-[#0a0118] via-[#1a0a2e] to-[#0f0520] text-white">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="pointer-events-none absolute h-[600px] w-[600px] rounded-full bg-gradient-to-r from-purple-500 to-blue-500 opacity-10 blur-3xl"
          animate={{ x: [0, 100, 0], y: [0, -100, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: "10%", left: "10%" }}
        />
        <motion.div
          className="pointer-events-none absolute h-[400px] w-[400px] rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 opacity-15 blur-3xl"
          animate={{ x: [0, -80, 0], y: [0, 80, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{ bottom: "20%", right: "10%" }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-12 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-5xl font-bold text-transparent lg:text-6xl">
            Account Settings
          </h1>
          <p className="text-xl text-gray-300">
            Manage your connected accounts and preferences
          </p>
        </motion.div>

        <div className="space-y-8">
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-card rounded-3xl border border-white/20 bg-white/5 p-8 backdrop-blur-xl"
          >
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold">Google Calendars</h2>
                <p className="text-gray-400">
                  Manage your connected calendar accounts
                </p>
              </div>
              <Button
                onClick={() => handleOAuthStart("google")}
                disabled={oauthLoading === "google"}
                className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:from-purple-600 hover:to-cyan-600"
              >
                {oauthLoading === "google" ? (
                  "Connecting..."
                ) : (
                  <>
                    <Plus className="mr-2 h-5 w-5" />
                    Connect Calendar
                  </>
                )}
              </Button>
            </div>

            {calendarAccounts.length ? (
              <div className="space-y-4">
                {calendarAccounts.map((account, idx) => (
                  <motion.div
                    key={account.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-5 sm:flex-row sm:items-center sm:justify-between"
                    whileHover={{
                      scale: 1.01,
                      borderColor: "rgba(255,255,255,0.3)",
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <motion.div
                        className="h-5 w-5 rounded-full"
                        style={{
                          backgroundColor:
                            COLOR_PALETTE[idx % COLOR_PALETTE.length],
                        }}
                        whileHover={{ scale: 1.2 }}
                      />
                      <div>
                        <div className="text-lg font-semibold">
                          {getAccountTitle(account)}
                        </div>
                        <div className="text-sm text-gray-400">
                          Last synced:{" "}
                          {formatTimestamp(
                            account.lastSyncedAt ?? account.linkedAt,
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSync(account.id)}
                        disabled={isSyncing && syncingAccountId === account.id}
                        className="text-cyan-400 hover:bg-cyan-500/20"
                      >
                        {isSyncing && syncingAccountId === account.id
                          ? "Syncing..."
                          : "Sync Now"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDisconnect(account.id)}
                        disabled={
                          isDisconnecting && activeAccountId === account.id
                        }
                        className="text-red-400 hover:bg-red-500/20"
                      >
                        {isDisconnecting && activeAccountId === account.id ? (
                          "Removing..."
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/20 p-6 text-center text-gray-300">
                No Google calendars connected yet. Connect one to start syncing
                events.
              </div>
            )}
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card rounded-3xl border border-white/20 bg-white/5 p-8 backdrop-blur-xl"
          >
            <div className="mb-6">
              <h2 className="text-3xl font-bold">Social Accounts</h2>
              <p className="text-gray-400">
                Connect social media for AI-generated posts
              </p>
            </div>

            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="rounded-xl border border-white/10 bg-white/5 p-6"
                whileHover={{
                  scale: 1.01,
                  borderColor: "rgba(255,255,255,0.3)",
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#0A66C2]">
                      <Linkedin className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">LinkedIn</div>
                      <div
                        className={`text-sm ${
                          linkedInAccounts.length
                            ? "text-green-400"
                            : "text-gray-400"
                        }`}
                      >
                        {linkedInAccounts.length
                          ? "Connected"
                          : "Not connected"}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() =>
                      linkedInAccounts.length
                        ? handleDisconnect(linkedInAccounts[0].id)
                        : handleOAuthStart("linkedin")
                    }
                    disabled={
                      (linkedInAccounts.length &&
                        isDisconnecting &&
                        activeAccountId === linkedInAccounts[0]?.id) ||
                      oauthLoading === "linkedin"
                    }
                    className={
                      linkedInAccounts.length
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:from-purple-600 hover:to-cyan-600"
                    }
                  >
                    {linkedInAccounts.length
                      ? isDisconnecting &&
                        activeAccountId === linkedInAccounts[0]?.id
                        ? "Disconnecting..."
                        : "Disconnect"
                      : oauthLoading === "linkedin"
                        ? "Opening..."
                        : "Connect"}
                  </Button>
                </div>

                {linkedInAccounts.length > 1 && (
                  <div className="mt-4 space-y-2">
                    {linkedInAccounts.slice(1).map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200"
                      >
                        <span>{getAccountTitle(account)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDisconnect(account.id)}
                          disabled={
                            isDisconnecting && activeAccountId === account.id
                          }
                          className="text-red-400 hover:bg-red-500/20"
                        >
                          {isDisconnecting && activeAccountId === account.id
                            ? "Removing..."
                            : "Disconnect"}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="rounded-xl border border-white/10 bg-white/5 p-6"
                whileHover={{
                  scale: 1.01,
                  borderColor: "rgba(255,255,255,0.3)",
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#1877F2]">
                      <Facebook className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">Facebook</div>
                      <div
                        className={`text-sm ${
                          facebookAccounts.length
                            ? "text-green-400"
                            : "text-gray-400"
                        }`}
                      >
                        {facebookAccounts.length
                          ? "Connected"
                          : "Not connected"}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() =>
                      facebookAccounts.length
                        ? handleDisconnect(facebookAccounts[0].id)
                        : handleOAuthStart("facebook")
                    }
                    disabled={
                      (facebookAccounts.length &&
                        isDisconnecting &&
                        activeAccountId === facebookAccounts[0]?.id) ||
                      oauthLoading === "facebook"
                    }
                    className={
                      facebookAccounts.length
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:from-purple-600 hover:to-cyan-600"
                    }
                  >
                    {facebookAccounts.length
                      ? isDisconnecting &&
                        activeAccountId === facebookAccounts[0]?.id
                        ? "Disconnecting..."
                        : "Disconnect"
                      : oauthLoading === "facebook"
                        ? "Opening..."
                        : "Connect"}
                  </Button>
                </div>

                {facebookAccounts.length > 1 && (
                  <div className="mt-4 space-y-2">
                    {facebookAccounts.slice(1).map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200"
                      >
                        <span>{getAccountTitle(account)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDisconnect(account.id)}
                          disabled={
                            isDisconnecting && activeAccountId === account.id
                          }
                          className="text-red-400 hover:bg-red-500/20"
                        >
                          {isDisconnecting && activeAccountId === account.id
                            ? "Removing..."
                            : "Disconnect"}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-card rounded-3xl border border-white/20 bg-white/5 p-8 backdrop-blur-xl"
          >
            <div className="mb-6">
              <h2 className="text-3xl font-bold">Bot Settings</h2>
              <p className="text-gray-400">Configure Recall.ai bot behavior</p>
            </div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-8"
            >
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {botLeadTime[0]} minutes
                  </div>
                  <div className="text-sm text-gray-400">
                    Bot joins before meeting starts
                  </div>
                </div>
              </div>

              <Slider
                value={botLeadTime}
                onValueChange={setBotLeadTime}
                min={1}
                max={15}
                step={1}
                className="mb-4"
              />
              <div className="flex justify-between text-sm text-gray-400">
                <span>1 min (Minimal)</span>
                <span>15 min (Maximum)</span>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleLeadTimeSave}
                  disabled={isSavingLeadTime}
                  className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:from-purple-600 hover:to-cyan-600"
                >
                  {isSavingLeadTime ? "Saving..." : "Save lead time"}
                </Button>
              </div>
            </motion.div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass-card rounded-3xl border border-white/20 bg-white/5 p-8 backdrop-blur-xl"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold">Automation Templates</h2>
                <p className="text-gray-300">
                  Manage automated workflows for meetings
                </p>
              </div>
              <Button
                asChild
                className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:from-purple-600 hover:to-cyan-600"
              >
                <Link href={`/${locale}/settings/automations`}>
                  Manage Automations
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            <p className="mt-4 text-gray-300">
              Configure automated workflows for LinkedIn and Facebook posts,
              email drafts, and more.
            </p>
          </motion.section>
        </div>
      </div>
    </div>
  )
}
