"use client"

import { useCallback, useEffect, useMemo, useRef } from "react"
import { io, type Socket } from "socket.io-client"
import { env } from "@/config/env"
import type { ChatMessage, ChatNotification } from "@/schemas/examples/chat"
import { useChatStore, useNotificationStore } from "../store"
import { toAppNotification } from "@/features/notifications/utils/mapNotification"

type ClientToServerEvents = {
  "chat:join": (roomSlug: string) => void
  "chat:leave": (roomSlug: string) => void
  "chat:send": (payload: { roomSlug: string; body: string }) => void
  "chat:typing": (payload: { roomSlug: string }) => void
  "chat:read": (payload: { roomSlug: string; messageIds: string[] }) => void
  "user:ping": () => void
}

type ServerToClientEvents = {
  "chat:new": (message: ChatMessage) => void
  "chat:typing": (payload: {
    roomSlug: string
    userId: string
    name: string
  }) => void
  "chat:error": (payload: { message: string }) => void
  "chat:read": (payload: {
    roomSlug: string
    userId: string
    updates: { messageId: string; readBy: string[] }[]
  }) => void
  "user:presence": (payload: {
    userId: string
    status: "online" | "away"
  }) => void
  "notification:new": (notification: ChatNotification) => void
}

type ChatSocket = Socket<ClientToServerEvents, ServerToClientEvents>

export function useChatSocket(params: {
  token: string | null
  userId: string
  joinedRooms: string[]
}) {
  const upsertMessage = useChatStore((state) => state.upsertMessage)
  const setTyping = useChatStore((state) => state.setTyping)
  const clearTyping = useChatStore((state) => state.clearTyping)
  const setPresence = useChatStore((state) => state.setPresence)
  const setConnected = useChatStore((state) => state.setConnected)
  const updateReadReceipts = useChatStore((state) => state.updateReadReceipts)
  const upsertNotification = useNotificationStore(
    (state) => state.upsertNotification,
  )
  const socketRef = useRef<ChatSocket | null>(null)
  const joinedRef = useRef<Set<string>>(new Set())
  const typingTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  )

  const socketUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return env.socketUrl ?? env.backendUrl ?? ""
    }
    return env.socketUrl ?? env.backendUrl ?? window.location.origin
  }, [])

  useEffect(() => {
    if (!params.token || !socketUrl) {
      return
    }
    const socket: ChatSocket = io(socketUrl, {
      path: "/socket.io",
      transports: ["websocket"],
      auth: { token: params.token },
      withCredentials: true,
    })
    socketRef.current = socket

    socket.on("connect", () => setConnected(true))
    socket.on("disconnect", () => setConnected(false))
    socket.on("chat:new", (message) => {
      upsertMessage(message, { isSelf: message.senderId === params.userId })
    })
    socket.on("chat:typing", ({ roomSlug, userId, name }) => {
      if (userId === params.userId) return
      setTyping(roomSlug, userId, name)
      const key = `${roomSlug}:${userId}`
      const previous = typingTimers.current.get(key)
      if (previous) {
        clearTimeout(previous)
      }
      typingTimers.current.set(
        key,
        setTimeout(() => {
          clearTyping(roomSlug, userId)
          typingTimers.current.delete(key)
        }, 1500),
      )
    })
    socket.on("user:presence", ({ userId, status }) => {
      setPresence(userId, status)
    })
    socket.on("notification:new", (notification) => {
      upsertNotification(toAppNotification(notification))
    })
    socket.on("chat:read", ({ roomSlug, updates }) => {
      updateReadReceipts(roomSlug, updates)
    })

    const pingInterval = setInterval(() => {
      socket.emit("user:ping")
    }, 15000)

    return () => {
      clearInterval(pingInterval)
      typingTimers.current.forEach((timer) => clearTimeout(timer))
      typingTimers.current.clear()
      joinedRef.current.clear()
      socket.disconnect()
      setConnected(false)
    }
  }, [
    clearTyping,
    params.token,
    params.userId,
    setConnected,
    setPresence,
    setTyping,
    socketUrl,
    upsertMessage,
    upsertNotification,
    updateReadReceipts,
  ])

  useEffect(() => {
    const socket = socketRef.current
    if (!socket || !params.token) {
      return
    }
    const joined = joinedRef.current
    const desired = new Set(params.joinedRooms)
    params.joinedRooms.forEach((slug) => {
      if (!joined.has(slug)) {
        socket.emit("chat:join", slug)
        joined.add(slug)
      }
    })
    Array.from(joined).forEach((slug) => {
      if (!desired.has(slug)) {
        socket.emit("chat:leave", slug)
        joined.delete(slug)
      }
    })
  }, [params.joinedRooms, params.token])

  const sendMessage = useCallback((roomSlug: string, body: string) => {
    const socket = socketRef.current
    if (!socket) return
    socket.emit("chat:send", { roomSlug, body })
  }, [])

  const emitTyping = useCallback((roomSlug: string) => {
    const socket = socketRef.current
    if (!socket) return
    socket.emit("chat:typing", { roomSlug })
  }, [])

  const markMessagesRead = useCallback((roomSlug: string, messageIds: string[]) => {
    const socket = socketRef.current
    if (!socket || !messageIds.length) return
    socket.emit("chat:read", { roomSlug, messageIds })
  }, [])

  return { sendMessage, emitTyping, markMessagesRead }
}

