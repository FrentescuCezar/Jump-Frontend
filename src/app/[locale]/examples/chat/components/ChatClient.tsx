"use client"

import { useEffect, useMemo } from "react"
import type { ChatMessage, ChatRoom } from "@/schemas/examples/chat"
import { useChatStore } from "@/features/examples/chat/store"
import { useChatSocket } from "@/features/examples/chat/hooks/useChatSocket"
import ChatSidebar from "./ChatSidebar"
import ChatRoomPanel from "./ChatRoomPanel"

type ChatClientProps = {
  rooms: ChatRoom[]
  initialRoom: string | null
  initialMessages: ChatMessage[]
  initialCursor: string | null
  token: string
  userId: string
  displayName: string
}

export default function ChatClient({
  rooms,
  initialRoom,
  initialMessages,
  initialCursor,
  token,
  userId,
  displayName,
}: ChatClientProps) {
  const setRooms = useChatStore((state) => state.setRooms)
  const addMessages = useChatStore((state) => state.addMessages)
  const setCursor = useChatStore((state) => state.setCursor)
  const roomsState = useChatStore((state) => state.rooms)
  const joinedRooms = useMemo(
    () => roomsState.map((room) => room.slug),
    [roomsState],
  )

  useEffect(() => {
    setRooms(rooms)
    if (initialRoom) {
      // Always refresh messages from server on mount to ensure we have the latest
      addMessages(initialRoom, initialMessages)
      setCursor(initialRoom, initialCursor ?? null)
    }
  }, [
    addMessages,
    initialCursor,
    initialMessages,
    initialRoom,
    rooms,
    setCursor,
    setRooms,
  ])

  const { sendMessage, emitTyping, markMessagesRead } = useChatSocket({
    token,
    userId,
    joinedRooms,
  })

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-4 py-10 lg:grid-cols-4">
      <div className="lg:col-span-1">
        <ChatSidebar currentUserId={userId} />
      </div>
      <div className="lg:col-span-3">
        <ChatRoomPanel
          sendMessage={sendMessage}
          emitTyping={emitTyping}
          displayName={displayName}
          userId={userId}
          markMessagesRead={markMessagesRead}
        />
      </div>
    </div>
  )
}
