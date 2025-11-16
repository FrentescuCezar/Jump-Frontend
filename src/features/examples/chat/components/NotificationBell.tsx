"use client"

import { useEffect, useMemo, useState } from "react"
import { Bell, Check, RefreshCw } from "lucide-react"
import { io } from "socket.io-client"
import { env } from "@/config/env"
import type { ChatNotification } from "@/schemas/examples/chat"
import { useNotificationStore } from "@/features/examples/chat/store"
import { toAppNotification } from "@/features/notifications/utils/mapNotification"
import type {
  AppNotification,
  NotificationSource,
} from "@/features/notifications/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { motion } from "motion/react"
import { useRouter } from "next/navigation"

type NotificationBellProps = {
  initialNotifications: ChatNotification[]
  locale: string
}

export function NotificationBell({
  initialNotifications,
  locale,
}: NotificationBellProps) {
  const setNotifications = useNotificationStore(
    (state) => state.setNotifications,
  )
  const upsertNotification = useNotificationStore(
    (state) => state.upsertNotification,
  )
  const markAsRead = useNotificationStore((state) => state.markAsRead)
  const notifications = useNotificationStore((state) => state.notifications)
  const [token, setToken] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()

  const socketUrl =
    env.socketUrl ??
    env.backendUrl ??
    (typeof window !== "undefined" ? window.location.origin : "")

  useEffect(() => {
    setNotifications(initialNotifications.map(toAppNotification))
  }, [initialNotifications, setNotifications])

  useEffect(() => {
    const fetchToken = async () => {
      const res = await fetch("/api/chat/token", { cache: "no-store" })
      if (res.ok) {
        const data = (await res.json()) as { token: string }
        setToken(data.token)
      }
    }
    fetchToken()
  }, [])

  useEffect(() => {
    if (!token || !socketUrl) return
    const socket = io(socketUrl, {
      path: "/socket.io",
      transports: ["websocket"],
      auth: { token },
      withCredentials: true,
    })
    socket.on("notification:new", (notification) => {
      upsertNotification(toAppNotification(notification))
    })
    const interval = setInterval(() => {
      socket.emit("user:ping")
    }, 15000)
    return () => {
      clearInterval(interval)
      socket.disconnect()
    }
  }, [socketUrl, token, upsertNotification])

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.readAt).length,
    [notifications],
  )

  const extractMeetingId = (notification: AppNotification) => {
    return resolveMeetingId(notification.metadata) ?? undefined
  }

  const refreshNotifications = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch("/api/examples/notifications", {
        cache: "no-store",
      })
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.map(toAppNotification))
      }
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleMarkRead = async (
    notificationId: string,
    source: NotificationSource,
  ) => {
    if (source === "api" || source === "calendar") {
      await fetch(`/api/examples/notifications/${notificationId}/read`, {
        method: "POST",
      })
    }
    markAsRead(notificationId)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative border-white/20 bg-white/5 text-white hover:bg-white/10 transition-colors"
        >
          <Bell className="h-5 w-5 text-white" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-linear-to-r from-purple-500 to-cyan-500 px-1.5 text-[10px] font-bold text-white shadow-lg shadow-purple-500/50 border border-white/20`}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </motion.span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-80 border-white/20 backdrop-blur-xl bg-white/5 text-white shadow-2xl"
        align="end"
      >
        <div className="p-2">
          <DropdownMenuLabel className="flex items-center justify-between px-2 py-2 text-white">
            <span className="text-base font-semibold">Notifications</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                refreshNotifications()
              }}
              disabled={isRefreshing}
              className="h-8 text-white/80 hover:text-white hover:bg-white/10 border-white/20"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/10" />
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 && (
              <div className="px-3 py-6 text-center">
                <span className="text-sm text-white/60">
                  You're all caught up.
                </span>
              </div>
            )}
            {notifications.map((notification, index) => {
              const isCalendarNotification = notification.source === "calendar"
              const changeDetails = extractChangeMetadata(notification.metadata)
              const eventAction = extractEventAction(notification.metadata)
              const indicatorGradient = isCalendarNotification
                ? "bg-linear-to-r from-cyan-300 to-emerald-300"
                : "bg-linear-to-r from-purple-400 to-cyan-400"
              const actionRing = isCalendarNotification
                ? "bg-linear-to-r from-cyan-500/20 to-emerald-500/20 border border-cyan-400/40"
                : "bg-linear-to-r from-purple-500/20 to-cyan-500/20 border border-purple-400/30"
              const itemBorder = isCalendarNotification
                ? "border-cyan-400/30 hover:border-cyan-300/40"
                : "border-white/10 hover:border-white/20"

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <DropdownMenuItem
                    className={`flex flex-col gap-2 px-3 py-3 my-1 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer focus:bg-white/10 ${itemBorder}`}
                    onSelect={(event) => {
                      const meetingId = extractMeetingId(notification)
                      if (!meetingId) {
                        event.preventDefault()
                      }
                      void handleMarkRead(notification.id, notification.source)
                      if (meetingId) {
                        router.push(`/${locale}/meetings/${meetingId}`)
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 w-full">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {!notification.readAt && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className={`w-2 h-2 rounded-full ${indicatorGradient}`}
                            />
                          )}
                          <span className="text-sm font-semibold text-white truncate">
                            {notification.title}
                          </span>
                          {eventAction && (
                            <span
                              className={`text-[10px] uppercase tracking-wide rounded-full px-2 py-0.5 font-semibold ${resolveEventActionBadge(eventAction)}`}
                            >
                              {formatEventActionLabel(eventAction)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/70 leading-relaxed line-clamp-2">
                          {notification.body}
                        </p>
                        {changeDetails.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {changeDetails.map((change) => (
                              <span
                                key={`${notification.id}-${change.field}`}
                                className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/80"
                              >
                                <span className="text-white/90">
                                  {change.label}
                                </span>
                                <span className="mx-1 text-white/50 capitalize">
                                  {formatChangeIndicator(change)}
                                </span>
                                <span>{getChangeValue(change)}</span>
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-white/50 mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!notification.readAt && (
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="shrink-0"
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center ${actionRing}`}
                          >
                            <Check
                              className={`h-3 w-3 ${
                                isCalendarNotification
                                  ? "text-cyan-200"
                                  : "text-purple-300"
                              }`}
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </DropdownMenuItem>
                </motion.div>
              )
            })}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

type NotificationChangeAction = "added" | "removed" | "updated"

type NotificationEventAction =
  | "created"
  | "updated"
  | "deleted"
  | "bot-completed"

type NotificationChange = {
  field: string
  label: string
  previous: string | null
  current: string | null
  action: NotificationChangeAction | null
}

function extractChangeMetadata(
  metadata: Record<string, unknown> | null | undefined,
): NotificationChange[] {
  if (!metadata) {
    return []
  }
  const rawChanges = metadata["changes"]
  if (!Array.isArray(rawChanges)) {
    return []
  }
  return rawChanges.reduce<NotificationChange[]>((acc, change) => {
    if (!change || typeof change !== "object") {
      return acc
    }
    const typedChange = change as Record<string, unknown>
    const field = getStringProp(typedChange, "field")
    const label = getStringProp(typedChange, "label")
    if (!field || !label) {
      return acc
    }
    acc.push({
      field,
      label,
      previous: getDisplayValue(typedChange, "previous"),
      current: getDisplayValue(typedChange, "current"),
      action: getActionProp(typedChange, "action"),
    })
    return acc
  }, [])
}

function getStringProp(
  obj: Record<string, unknown>,
  key: string,
): string | null {
  const value = obj[key]
  if (typeof value === "string") {
    return value
  }
  return null
}

function extractEventAction(
  metadata: Record<string, unknown> | null | undefined,
): NotificationEventAction | null {
  if (!metadata) {
    return null
  }
  const raw = metadata["eventAction"]
  if (
    raw === "created" ||
    raw === "updated" ||
    raw === "deleted" ||
    raw === "bot-completed"
  ) {
    return raw
  }
  return null
}

function resolveMeetingId(
  metadata: Record<string, unknown> | null | undefined,
): string | null {
  if (!metadata || typeof metadata !== "object") {
    return null
  }
  const record = metadata as Record<string, unknown>
  const candidates = ["meetingId", "eventId", "calendarEventId", "id"]
  for (const candidate of candidates) {
    const value = record[candidate]
    if (typeof value === "string" && value.trim().length > 0) {
      return value
    }
  }
  return null
}

function getActionProp(
  obj: Record<string, unknown>,
  key: string,
): NotificationChangeAction | null {
  const value = obj[key]
  if (value === "added" || value === "removed" || value === "updated") {
    return value
  }
  return null
}

function getDisplayValue(
  obj: Record<string, unknown>,
  key: string,
): string | null {
  const value = obj[key]
  if (value === null || value === undefined) {
    return null
  }
  if (typeof value === "string") {
    return value
  }
  return String(value)
}

function formatChangeIndicator(change: NotificationChange) {
  if (change.action === "added") {
    return "added:"
  }
  if (change.action === "removed") {
    return "removed:"
  }
  if (change.action === "updated") {
    return "updated:"
  }
  return "→"
}

function getChangeValue(change: NotificationChange) {
  if (change.action === "removed") {
    return change.previous ?? "Removed"
  }
  return change.current ?? "Updated"
}

function formatEventActionLabel(action: NotificationEventAction) {
  switch (action) {
    case "created":
      return "Meeting added"
    case "updated":
      return "Meeting updated"
    case "deleted":
      return "Meeting removed"
    case "bot-completed":
      return "Bot completed"
    default:
      return action
  }
}

function resolveEventActionBadge(action: NotificationEventAction) {
  switch (action) {
    case "created":
      return "bg-green-500/20 text-green-200 border border-green-400/40"
    case "updated":
      return "bg-blue-500/20 text-blue-200 border border-blue-400/40"
    case "deleted":
      return "bg-red-500/20 text-red-200 border border-red-400/40"
    case "bot-completed":
      return "bg-purple-500/20 text-purple-200 border border-purple-400/40"
    default:
      return "bg-white/10 text-white/80 border border-white/20"
  }
}
