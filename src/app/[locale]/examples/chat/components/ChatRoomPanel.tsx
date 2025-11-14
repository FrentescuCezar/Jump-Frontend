"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "react-toastify"
import { Check, CheckCheck } from "lucide-react"
import { format, isToday, isYesterday } from "date-fns"
import { useChatStore } from "@/features/examples/chat/store"
import type { ChatMessage } from "@/schemas/examples/chat"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const EMPTY_MESSAGES: ChatMessage[] = []
const EMPTY_TYPING: Record<string, string> = {}

type ChatRoomPanelProps = {
  sendMessage: (roomSlug: string, body: string) => void
  emitTyping: (roomSlug: string) => void
  displayName: string
  userId: string
  markMessagesRead: (roomSlug: string, messageIds: string[]) => void
}

export default function ChatRoomPanel({
  sendMessage,
  emitTyping,
  displayName,
  userId,
  markMessagesRead,
}: ChatRoomPanelProps) {
  const t = useTranslations("Examples.Chat.room")
  const activeRoom = useChatStore((state) => state.activeRoom)
  const rooms = useChatStore((state) => state.rooms)
  const messages = useChatStore((state) => {
    if (!state.activeRoom) {
      return EMPTY_MESSAGES
    }
    return state.messages[state.activeRoom] ?? EMPTY_MESSAGES
  })
  const addMessages = useChatStore((state) => state.addMessages)
  const setCursor = useChatStore((state) => state.setCursor)
  const messageStatus = useChatStore((state) => state.messageStatus)
  const cursor = useChatStore((state) => {
    if (!state.activeRoom) {
      return null
    }
    return state.cursors[state.activeRoom] ?? null
  })
  const typing = useChatStore((state) => {
    if (!state.activeRoom) {
      return EMPTY_TYPING
    }
    return state.typing[state.activeRoom] ?? EMPTY_TYPING
  })
  const presence = useChatStore((state) => state.presence)
  const [inputValue, setInputValue] = useState("")
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const topSentinelRef = useRef<HTMLDivElement | null>(null)
  const loadingOlderRef = useRef(false)

  const typingUsers = useMemo(
    () => Object.values(typing).filter(Boolean),
    [typing],
  )
  const groupedMessages = useMemo(
    () => groupMessagesByDay(messages),
    [messages],
  )

  const roomMeta = rooms.find((room) => room.slug === activeRoom)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, activeRoom])

  useEffect(() => {
    if (!activeRoom) return
    const unreadMessages = messages.filter(
      (message) =>
        message.senderId !== userId && !message.readBy?.includes(userId),
    )
    if (unreadMessages.length === 0) return
    markMessagesRead(
      activeRoom,
      unreadMessages.map((message) => message.id),
    )
  }, [activeRoom, markMessagesRead, messages, userId])

  const loadOlder = useCallback(async () => {
    if (!activeRoom || !cursor) {
      return
    }
    setIsLoadingHistory(true)
    const container = scrollRef.current
    const previousScrollHeight = container?.scrollHeight ?? 0
    const previousScrollTop = container?.scrollTop ?? 0
    try {
      const response = await fetch(
        `/api/examples/chat/rooms/${activeRoom}/history?before=${cursor}`,
        { cache: "no-store" },
      )
      if (!response.ok) {
        throw new Error("Failed to load history")
      }
      const payload: { messages: ChatMessage[]; nextCursor: string | null } =
        await response.json()
      addMessages(activeRoom, payload.messages, { prepend: true })
      setCursor(activeRoom, payload.nextCursor)
      requestAnimationFrame(() => {
        if (container) {
          const newHeight = container.scrollHeight
          container.scrollTop =
            newHeight - previousScrollHeight + previousScrollTop
        }
      })
    } catch (error) {
      toast.error(t("errors.history"))
      console.error(error)
    } finally {
      setIsLoadingHistory(false)
    }
  }, [activeRoom, addMessages, cursor, setCursor, t])

  useEffect(() => {
    const sentinel = topSentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          cursor &&
          !isLoadingHistory &&
          !loadingOlderRef.current
        ) {
          loadingOlderRef.current = true
          loadOlder().finally(() => {
            loadingOlderRef.current = false
          })
        }
      },
      { threshold: 1 },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [cursor, isLoadingHistory, loadOlder])

  const handleSend = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault()
      if (!activeRoom || !inputValue.trim()) {
        return
      }
      const body = inputValue.trim()
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`
      const optimisticMessage: ChatMessage = {
        id: tempId,
        roomId: roomMeta?.id ?? "",
        roomSlug: activeRoom,
        senderId: userId,
        senderName: displayName,
        body,
        createdAt: new Date().toISOString(),
        readBy: [userId],
      }
      // Optimistically add message immediately
      addMessages(activeRoom, [optimisticMessage])
      // Mark as pending
      useChatStore.setState((state) => ({
        messageStatus: {
          ...state.messageStatus,
          [tempId]: "pending",
        },
      }))
      // Clear input immediately for better UX
      setInputValue("")
      // Send via socket (server will send back the real message)
      sendMessage(activeRoom, body)
    },
    [
      activeRoom,
      inputValue,
      sendMessage,
      displayName,
      roomMeta,
      addMessages,
      userId,
    ],
  )

  const handleTyping = useCallback(() => {
    if (!activeRoom) return
    emitTyping(activeRoom)
  }, [activeRoom, emitTyping])

  if (!roomMeta) {
    return (
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <p className="text-muted-foreground">{t("emptyState")}</p>
      </section>
    )
  }

  return (
    <section className="flex h-full flex-col rounded-2xl border bg-card shadow-sm">
      <header className="border-b px-6 py-4">
        <p className="text-xs uppercase tracking-wide text-primary">
          {t("badge")}
        </p>
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{roomMeta.name}</h1>
            <p className="text-sm text-muted-foreground">
              {roomMeta.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {roomMeta.participants.map((participant) => (
              <span
                key={participant}
                className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5"
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    presence[participant] === "online"
                      ? "bg-emerald-500"
                      : "bg-slate-400"
                  }`}
                />
                {participant}
              </span>
            ))}
          </div>
        </div>
      </header>
      <div className="flex flex-1 flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4">
          <div ref={topSentinelRef} className="flex justify-center py-2">
            {cursor ? (
              <span className="text-xs text-muted-foreground">
                {isLoadingHistory ? t("loadingHistory") : t("loadHistory")}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                {t("start")}
              </span>
            )}
          </div>
          <div className="space-y-4">
            {groupedMessages.map((group) => (
              <div key={group.dateKey} className="space-y-3">
                <div className="sticky top-2 z-10 flex justify-center">
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                    {group.label}
                  </span>
                </div>
                <div className="space-y-3">
                  {group.messages.map((message) => {
                    const isOwnMessage = message.senderId === userId
                    const status = messageStatus[message.id] ?? "confirmed"
                    const othersHaveRead =
                      message.readBy?.some(
                        (reader) => reader !== message.senderId,
                      ) ?? false
                    const viewers =
                      message.readBy?.filter(
                        (reader) => reader !== message.senderId,
                      ) ?? []
                    return (
                      <div
                        key={message.id}
                        className={`space-y-1 ${
                          isOwnMessage ? "flex flex-col items-end" : ""
                        }`}
                      >
                        <div className="flex items-baseline gap-2">
                          {!isOwnMessage && (
                            <p className="font-semibold">
                              {message.senderName}
                            </p>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex items-end gap-1.5">
                          <p
                            className={`rounded-2xl px-3 py-2 text-sm max-w-[80%] ${
                              isOwnMessage
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            {message.body}
                          </p>
                          {isOwnMessage && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  className="flex items-center pb-1 shrink-0 ml-1 focus:outline-none"
                                  title={
                                    status === "pending"
                                      ? "Sent"
                                      : othersHaveRead
                                        ? "Read"
                                        : "Delivered"
                                  }
                                >
                                  {status === "pending" ? (
                                    <Check
                                      className="h-4 w-4 text-primary-foreground/80"
                                      strokeWidth={3}
                                      aria-label="Message sent"
                                    />
                                  ) : (
                                    <CheckCheck
                                      className={`h-4 w-4 ${
                                        othersHaveRead
                                          ? "text-sky-400"
                                          : "text-primary-foreground"
                                      }`}
                                      strokeWidth={3}
                                      aria-label={
                                        othersHaveRead
                                          ? "Message read"
                                          : "Message delivered"
                                      }
                                    />
                                  )}
                                </button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-56 text-sm"
                                align="end"
                              >
                                <p className="font-semibold mb-2">Seen by</p>
                                {viewers.length > 0 ? (
                                  <div className="space-y-2">
                                    {viewers.map((reader) => (
                                      <div
                                        key={reader}
                                        className="flex items-center gap-2"
                                      >
                                        <Avatar className="h-6 w-6 border">
                                          <AvatarFallback>
                                            {reader.slice(0, 2).toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs">
                                          {reader}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground">
                                    Nobody has seen this yet.
                                  </p>
                                )}
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t px-6 py-3">
          {typingUsers.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {t("typing", { users: typingUsers.join(", ") })}
            </p>
          )}
          <form onSubmit={handleSend} className="mt-2 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={handleTyping}
              placeholder={t("placeholder", { name: displayName })}
              className="flex-1 rounded-full border px-4 py-2 text-sm shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            />
            <button
              type="submit"
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
              disabled={!inputValue.trim()}
            >
              {t("send")}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

function groupMessagesByDay(messages: ChatMessage[]) {
  const groups: {
    dateKey: string
    label: string
    messages: ChatMessage[]
  }[] = []

  messages.forEach((message) => {
    const date = new Date(message.createdAt)
    const dateKey = format(date, "yyyy-MM-dd")
    const label = getDateLabel(date)
    const existing = groups.find((group) => group.dateKey === dateKey)
    if (existing) {
      existing.messages.push(message)
    } else {
      groups.push({
        dateKey,
        label,
        messages: [message],
      })
    }
  })

  return groups
}

function getDateLabel(date: Date) {
  if (isToday(date)) return "Today"
  if (isYesterday(date)) return "Yesterday"
  return format(date, "EEEE, MMMM d")
}
