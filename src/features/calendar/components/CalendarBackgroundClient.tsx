"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useCalendarAutoSync } from "@/features/calendar/hooks/useCalendarAutoSync"
import { useCalendarNotificationsBridge } from "@/features/calendar/hooks/useCalendarNotificationsBridge"
import { useCalendarSyncStore } from "@/features/calendar/store/sync"

type CalendarBackgroundClientProps = {
  userId: string
  locale: string
}

export function CalendarBackgroundClient({
  userId,
  locale,
}: CalendarBackgroundClientProps) {
  const queryClient = useQueryClient()
  const {
    isSyncing,
    error,
    lastSummary,
    lastCompletedAt,
    syncNow,
  } = useCalendarAutoSync({ enabled: Boolean(userId) })
  const setState = useCalendarSyncStore((state) => state.setState)
  const setSyncNow = useCalendarSyncStore((state) => state.setSyncNow)

  useEffect(() => {
    setState({
      isSyncing,
      error,
      lastSummary,
      lastCompletedAt,
    })
  }, [error, isSyncing, lastCompletedAt, lastSummary, setState])

  useEffect(() => {
    setSyncNow(syncNow ?? null)
    return () => setSyncNow(null)
  }, [setSyncNow, syncNow])

  useEffect(() => {
    if (!lastCompletedAt) {
      return
    }
    queryClient.invalidateQueries({
      queryKey: ["calendar-events"],
    })
  }, [lastCompletedAt, queryClient])

  useCalendarNotificationsBridge({ userId, locale })

  return null
}

