"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { env } from "@/config/env"
import type { MeetingChatMessage } from "@/schemas/meetings/chat"

type ClientToServerEvents = {
  "meeting:join": (payload: { meetingId: string }) => void
  "meeting:leave": (payload: { meetingId: string }) => void
  "meeting:send": (payload: { meetingId: string; body: string }) => void
  "meeting:typing": (payload: { meetingId: string }) => void
  "meeting:read": (payload: { meetingId: string; messageIds: string[] }) => void
}

type ServerToClientEvents = {
  "meeting:new": (message: MeetingChatMessage) => void
  "meeting:typing": (payload: {
    meetingId: string
    userId: string
    name: string
  }) => void
  "meeting:error": (payload: {
    message: string
    clientMessageId?: string
  }) => void
  "meeting:read": (payload: {
    meetingId: string
    userId: string
    updates: { messageId: string; readBy: string[] }[]
  }) => void
  "meeting:presence": (payload: { meetingId: string; userCount: number }) => void
}

type MeetingSocket = Socket<ClientToServerEvents, ServerToClientEvents>

type Params = {
  meetingId: string
  enabled: boolean
  onMessage: (message: MeetingChatMessage) => void
  onTyping: (payload: { userId: string; name: string }) => void
  onRead: (updates: { messageId: string; readBy: string[] }[]) => void
  onPresence?: (payload: { userCount: number }) => void
  onError?: (payload: { message: string; clientMessageId?: string }) => void
}

export function useMeetingChatSocket({
  meetingId,
  enabled,
  onMessage,
  onTyping,
  onRead,
  onPresence,
  onError,
}: Params) {
  const socketRef = useRef<MeetingSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const socketUrl =
    env.socketUrl ??
    env.backendUrl ??
    (typeof window !== "undefined" ? window.location.origin : "")

  useEffect(() => {
    if (!enabled || !socketUrl) {
      return
    }
    let cancelled = false
    let reconnectInterval: NodeJS.Timeout | null = null

    const connect = async () => {
      try {
        const res = await fetch("/api/chat/token", { cache: "no-store" })
        if (!res.ok) {
          throw new Error("Unable to fetch chat token")
        }
        const data = (await res.json()) as { token: string }
        if (cancelled) {
          return
        }
        const socket: MeetingSocket = io(socketUrl, {
          path: "/socket.io",
          transports: ["websocket"],
          auth: { token: data.token },
          withCredentials: true,
        })
        socketRef.current = socket

        const joinRoom = () => {
          socket.emit("meeting:join", { meetingId })
        }

        socket.on("connect", () => {
          setConnected(true)
          joinRoom()
        })
        socket.on("disconnect", () => {
          setConnected(false)
        })
        socket.on("meeting:new", (message) => {
          if (message.meetingId === meetingId) {
            onMessage(message)
          }
        })
        socket.on("meeting:typing", (payload) => {
          if (payload.meetingId === meetingId) {
            onTyping({ userId: payload.userId, name: payload.name })
          }
        })
        socket.on("meeting:read", (payload) => {
          if (payload.meetingId === meetingId) {
            onRead(payload.updates)
          }
        })
        socket.on("meeting:error", (payload) => {
          onError?.(payload)
        })
        socket.on("meeting:presence", (payload) => {
          if (payload.meetingId === meetingId) {
            onPresence?.({ userCount: payload.userCount })
          }
        })
      } catch (error) {
        if (!cancelled) {
          onError?.(
            error instanceof Error
              ? { message: error.message }
              : { message: "Unable to connect to meeting chat" },
          )
          reconnectInterval = setTimeout(() => {
            void connect()
          }, 3000)
        }
      }
    }

    void connect()

    return () => {
      cancelled = true
      if (reconnectInterval) {
        clearTimeout(reconnectInterval)
      }
      if (socketRef.current) {
        socketRef.current.emit("meeting:leave", { meetingId })
        socketRef.current.disconnect()
      }
      socketRef.current = null
      setConnected(false)
    }
  }, [enabled, meetingId, onError, onMessage, onPresence, onRead, onTyping, socketUrl])

  const sendMessage = useCallback(
    (body: string, options?: { clientMessageId?: string }) => {
      if (!body.trim()) {
        return
      }
      socketRef.current?.emit("meeting:send", {
        meetingId,
        body,
        clientMessageId: options?.clientMessageId,
      })
    },
    [meetingId],
  )

  const emitTyping = useCallback(() => {
    socketRef.current?.emit("meeting:typing", { meetingId })
  }, [meetingId])

  const markMessagesRead = useCallback(
    (messageIds: string[]) => {
      if (!messageIds.length) {
        return
      }
      socketRef.current?.emit("meeting:read", { meetingId, messageIds })
    },
    [meetingId],
  )

  return {
    connected,
    sendMessage,
    emitTyping,
    markMessagesRead,
  }
}

