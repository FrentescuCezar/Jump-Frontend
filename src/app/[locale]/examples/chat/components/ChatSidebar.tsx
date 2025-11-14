"use client"

import { useCallback } from "react"
import { useTranslations } from "next-intl"
import { useChatStore } from "@/features/examples/chat/store"
import { cn } from "@/lib/utils"
import { CreateChatRoomDialog } from "./CreateChatRoomDialog"

type ChatSidebarProps = {
  currentUserId: string
}

export default function ChatSidebar({ currentUserId }: ChatSidebarProps) {
  const t = useTranslations("Examples.Chat.sidebar")
  const rooms = useChatStore((state) => state.rooms)
  const activeRoom = useChatStore((state) => state.activeRoom)
  const setActiveRoom = useChatStore((state) => state.setActiveRoom)
  const connected = useChatStore((state) => state.connected)

  const handleSelect = useCallback(
    (slug: string) => {
      setActiveRoom(slug)
    },
    [setActiveRoom],
  )

  return (
    <aside className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-primary">
            {t("badge")}
          </p>
          <h2 className="text-lg font-semibold">{t("title")}</h2>
        </div>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium",
            connected
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-200 text-slate-600",
          )}
        >
          {connected ? t("status.online") : t("status.offline")}
        </span>
      </div>
      <div className="mt-4 space-y-4">
        <CreateChatRoomDialog />
        <div className="space-y-2">
          {rooms.map((room) => (
            <button
              key={room.slug}
              type="button"
              onClick={() => handleSelect(room.slug)}
              className={cn(
                "w-full rounded-xl border px-3 py-3 text-left transition hover:border-primary",
                activeRoom === room.slug ? "border-primary bg-primary/5" : "",
              )}
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold">{room.name}</p>
                {room.unreadCount > 0 && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                    {room.unreadCount}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {room.description}
              </p>
              {room.lastMessage ? (
                <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">
                  <span className="font-medium">
                    {room.lastMessage.senderName}
                  </span>
                  {": "}
                  {room.lastMessage.body}
                </p>
              ) : null}
            </button>
          ))}
          {rooms.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("empty")}</p>
          )}
        </div>
      </div>
    </aside>
  )
}

