"use client"

import { useEffect, useMemo, useState } from "react"
import { Bell, Check } from "lucide-react"
import { io } from "socket.io-client"
import { env } from "@/config/env"
import type { ChatNotification } from "@/schemas/examples/chat"
import { useNotificationStore } from "@/features/examples/chat/store"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

type NotificationBellProps = {
  initialNotifications: ChatNotification[]
}

export function NotificationBell({ initialNotifications }: NotificationBellProps) {
  const setNotifications = useNotificationStore((state) => state.setNotifications)
  const upsertNotification = useNotificationStore(
    (state) => state.upsertNotification,
  )
  const markAsRead = useNotificationStore((state) => state.markAsRead)
  const notifications = useNotificationStore((state) => state.notifications)
  const [token, setToken] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const socketUrl =
    env.socketUrl ??
    env.backendUrl ??
    (typeof window !== "undefined" ? window.location.origin : "")

  useEffect(() => {
    setNotifications(initialNotifications)
  }, [initialNotifications, setNotifications])

  useEffect(() => {
    const fetchToken = async () => {
      const res = await fetch("/api/examples/chat/token", { cache: "no-store" })
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
      upsertNotification(notification)
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

  const refreshNotifications = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch("/api/examples/notifications", {
        cache: "no-store",
      })
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleMarkRead = async (notificationId: string) => {
    await fetch(`/api/examples/notifications/${notificationId}/read`, {
      method: "POST",
    })
    markAsRead(notificationId)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshNotifications}
            disabled={isRefreshing}
          >
            {isRefreshing ? "…" : "Refresh"}
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 && (
          <DropdownMenuItem disabled>
            <span className="text-sm text-muted-foreground">
              You're all caught up.
            </span>
          </DropdownMenuItem>
        )}
        {notifications.map((notification) => (
          <DropdownMenuItem
            key={notification.id}
            className="flex flex-col gap-1"
            onSelect={(event) => {
              event.preventDefault()
              handleMarkRead(notification.id)
            }}
          >
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>{notification.title}</span>
              {!notification.readAt && (
                <Check className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {notification.body}
            </p>
            <p className="text-xs text-slate-400">
              {new Date(notification.createdAt).toLocaleString()}
            </p>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

