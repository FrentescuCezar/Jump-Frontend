"use client"

import { create } from "zustand"
import type { CalendarSyncSummary } from "@/features/calendar/types"

type CalendarSyncState = {
  isSyncing: boolean
  error: string | null
  lastSummary: CalendarSyncSummary | null
  lastCompletedAt: string | null
  syncNow: (() => Promise<CalendarSyncSummary>) | null
  setState: (
    patch: Partial<Omit<CalendarSyncState, "setState" | "setSyncNow">>,
  ) => void
  setSyncNow: (fn: (() => Promise<CalendarSyncSummary>) | null) => void
}

export const useCalendarSyncStore = create<CalendarSyncState>((set) => ({
  isSyncing: false,
  error: null,
  lastSummary: null,
  lastCompletedAt: null,
  syncNow: null,
  setState: (patch) =>
    set((state) => {
      const entries = Object.entries(patch) as Array<
        [keyof CalendarSyncState, CalendarSyncState[keyof CalendarSyncState]]
      >
      const hasChanges = entries.some(([key, value]) => state[key] !== value)
      if (!hasChanges) {
        return state
      }
      return {
        ...state,
        ...patch,
      }
    }),
  setSyncNow: (fn) =>
    set((state) => {
      if (state.syncNow === fn) {
        return state
      }
      return {
        ...state,
        syncNow: fn,
      }
    }),
}))
