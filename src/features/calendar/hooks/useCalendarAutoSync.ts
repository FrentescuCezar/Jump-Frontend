"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { CalendarSyncSummary } from "@/features/calendar/types"
import { syncCalendarNowAction } from "@/features/calendar/actions/syncCalendarNowAction"
import { CALENDAR_SYNC_INTERVAL_MS } from "@/features/calendar/constants"

type UseCalendarAutoSyncOptions = {
  enabled?: boolean
  intervalMs?: number
  runOnMount?: boolean
}

type SyncPromise = Promise<CalendarSyncSummary>

export function useCalendarAutoSync({
  enabled = true,
  intervalMs = CALENDAR_SYNC_INTERVAL_MS,
  runOnMount = true,
}: UseCalendarAutoSyncOptions = {}) {
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastSummary, setLastSummary] = useState<CalendarSyncSummary | null>(
    null,
  )
  const [lastCompletedAt, setLastCompletedAt] = useState<string | null>(null)
  const inFlightRef = useRef<SyncPromise | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const syncNow = useCallback(async (): SyncPromise => {
    if (inFlightRef.current) {
      return inFlightRef.current
    }

    const promise = (async () => {
      setIsSyncing(true)
      setError(null)
      try {
        const summary = await syncCalendarNowAction()
        setLastSummary(summary)
        setLastCompletedAt(new Date().toISOString())
        return summary
      } catch (cause) {
        const message =
          cause instanceof Error ? cause.message : "Unable to sync calendars"
        setError(message)
        throw cause
      } finally {
        setIsSyncing(false)
        inFlightRef.current = null
      }
    })()

    inFlightRef.current = promise
    return promise
  }, [])

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    if (runOnMount) {
      syncNow().catch(() => undefined)
    }

    intervalRef.current = setInterval(() => {
      syncNow().catch(() => undefined)
    }, intervalMs)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [enabled, intervalMs, runOnMount, syncNow])

  return {
    isSyncing,
    error,
    lastSummary,
    lastCompletedAt,
    syncNow,
  }
}
