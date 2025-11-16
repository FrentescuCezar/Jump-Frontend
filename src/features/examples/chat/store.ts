"use client"

import { create } from "zustand"
import type { ChatMessage, ChatRoom } from "@/schemas/examples/chat"
import type { AppNotification } from "@/features/notifications/types"

type PresenceStatus = "online" | "away"
type MessageStatus = "pending" | "confirmed"

type ChatState = {
  rooms: ChatRoom[]
  activeRoom: string | null
  messages: Record<string, ChatMessage[]>
  messageStatus: Record<string, MessageStatus> // Track status by message ID
  cursors: Record<string, string | null>
  typing: Record<string, Record<string, string>>
  presence: Record<string, PresenceStatus>
  connected: boolean
  setRooms: (rooms: ChatRoom[]) => void
  addRoom: (room: ChatRoom) => void
  setActiveRoom: (slug: string) => void
  setCursor: (slug: string, cursor: string | null) => void
  addMessages: (
    slug: string,
    incoming: ChatMessage[],
    opts?: { prepend?: boolean },
  ) => void
  upsertMessage: (message: ChatMessage, opts?: { isSelf?: boolean }) => void
  setTyping: (slug: string, userId: string, name: string) => void
  clearTyping: (slug: string, userId: string) => void
  setPresence: (userId: string, status: PresenceStatus) => void
  setConnected: (connected: boolean) => void
  updateReadReceipts: (
    roomSlug: string,
    updates: { messageId: string; readBy: string[] }[],
  ) => void
}

export const useChatStore = create<ChatState>((set) => ({
  rooms: [],
  activeRoom: null,
  messages: {},
  messageStatus: {},
  cursors: {},
  typing: {},
  presence: {},
  connected: false,
  setRooms: (rooms) =>
    set((state) => {
      const activeRoom =
        state.activeRoom && rooms.some((room) => room.slug === state.activeRoom)
          ? state.activeRoom
          : (rooms[0]?.slug ?? null)
      return { rooms, activeRoom }
    }),
  addRoom: (room) =>
    set((state) => {
      const filtered = state.rooms.filter(
        (existing) => existing.slug !== room.slug,
      )
      return {
        rooms: [room, ...filtered],
        activeRoom: room.slug,
        messages: state.messages[room.slug]
          ? state.messages
          : { ...state.messages, [room.slug]: [] },
        cursors: state.cursors[room.slug]
          ? state.cursors
          : { ...state.cursors, [room.slug]: null },
      }
    }),
  setActiveRoom: (slug) => set({ activeRoom: slug }),
  setCursor: (slug, cursor) =>
    set((state) => ({
      cursors: { ...state.cursors, [slug]: cursor },
    })),
  addMessages: (slug, incoming, opts) =>
    set((state) => {
      const current = state.messages[slug] ?? []
      const deduped = [...current]
      const existingIds = new Set(current.map((msg) => msg.id))
      const newStatus: Record<string, MessageStatus> = {}
      incoming.forEach((msg) => {
        const normalized = {
          ...msg,
          readBy: msg.readBy ?? [],
        }
        if (!existingIds.has(msg.id)) {
          if (opts?.prepend) {
            deduped.unshift(normalized)
          } else {
            deduped.push(normalized)
          }
          // Mark as confirmed if coming from server (not optimistic)
          if (!msg.id.startsWith("temp-")) {
            newStatus[msg.id] = "confirmed"
          }
        }
      })
      return {
        messages: {
          ...state.messages,
          [slug]: deduped.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          ),
        },
        messageStatus: { ...state.messageStatus, ...newStatus },
      }
    }),
  upsertMessage: (message, opts) =>
    set((state) => {
      const current = state.messages[message.roomSlug] ?? []
      // Remove optimistic messages (temp-*) from the same sender in the same room
      // This ensures the real message replaces the optimistic one
      const tempIdsToRemove: string[] = []
      const filtered = current.filter((item) => {
        if (
          item.id.startsWith("temp-") &&
          item.senderId === message.senderId &&
          item.roomSlug === message.roomSlug &&
          item.body === message.body
        ) {
          tempIdsToRemove.push(item.id)
          return false
        }
        return item.id !== message.id
      })
      filtered.push({
        ...message,
        readBy: message.readBy ?? [],
      })
      filtered.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
      const rooms = state.rooms.map((room) =>
        room.slug === message.roomSlug
          ? {
              ...room,
              lastMessage: message,
              unreadCount:
                room.slug === state.activeRoom || opts?.isSelf
                  ? 0
                  : room.unreadCount + 1,
            }
          : room,
      )
      // Remove status for temp messages and mark real message as confirmed
      const newStatus = { ...state.messageStatus }
      tempIdsToRemove.forEach((id) => delete newStatus[id])
      newStatus[message.id] = "confirmed"
      return {
        messages: { ...state.messages, [message.roomSlug]: filtered },
        messageStatus: newStatus,
        rooms,
      }
    }),
  setTyping: (slug, userId, name) =>
    set((state) => ({
      typing: {
        ...state.typing,
        [slug]: { ...(state.typing[slug] ?? {}), [userId]: name },
      },
    })),
  clearTyping: (slug, userId) =>
    set((state) => {
      const next = { ...(state.typing[slug] ?? {}) }
      delete next[userId]
      return {
        typing: { ...state.typing, [slug]: next },
      }
    }),
  setPresence: (userId, status) =>
    set((state) => ({
      presence: { ...state.presence, [userId]: status },
    })),
  setConnected: (connected) => set({ connected }),
  updateReadReceipts: (roomSlug, updates) =>
    set((state) => {
      if (!updates.length) {
        return {}
      }
      const messages = state.messages[roomSlug] ?? []
      if (!messages.length) {
        return {}
      }
      const updateMap = new Map(
        updates.map((update) => [update.messageId, update.readBy]),
      )
      const nextMessages = messages.map((message) => {
        const nextReadBy = updateMap.get(message.id)
        if (!nextReadBy) {
          return message
        }
        return {
          ...message,
          readBy: nextReadBy,
        }
      })
      return {
        messages: { ...state.messages, [roomSlug]: nextMessages },
      }
    }),
}))

type NotificationState = {
  notifications: AppNotification[]
  setNotifications: (items: AppNotification[]) => void
  upsertNotification: (notification: AppNotification) => void
  markAsRead: (notificationId: string) => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
  upsertNotification: (notification) =>
    set((state) => {
      const next = state.notifications.filter(
        (item) => item.id !== notification.id,
      )
      next.unshift(notification)
      next.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      return { notifications: next }
    }),
  markAsRead: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, readAt: new Date().toISOString() }
          : notification,
      ),
    })),
}))
