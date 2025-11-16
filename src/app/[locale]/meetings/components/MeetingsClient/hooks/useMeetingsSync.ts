import { useState, useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useCalendarSyncStore } from "@/features/calendar/store/sync"
import { useShallow } from "zustand/react/shallow"

/**
 * Hook for managing calendar sync functionality
 */
export function useMeetingsSync(refetch: () => Promise<unknown>) {
  const [isManualSyncing, setIsManualSyncing] = useState(false)
  const { isSyncing, syncError, syncNow } = useCalendarSyncStore(
    useShallow((state) => ({
      isSyncing: state.isSyncing,
      syncError: state.error,
      syncNow: state.syncNow,
    })),
  )

  const queryClient = useQueryClient()

  const handleSync = useCallback(async () => {
    if (!syncNow) {
      return
    }
    setIsManualSyncing(true)
    try {
      await syncNow()
      // Invalidate and remove calendar event queries to force fresh fetch after sync
      await queryClient.removeQueries({
        queryKey: ["calendar-events"],
      })
      await refetch()
    } catch (error) {
      console.error("Failed to sync calendar", error)
    } finally {
      setIsManualSyncing(false)
    }
  }, [syncNow, queryClient, refetch])

  const isAnySyncing = isSyncing || isManualSyncing

  return {
    isAnySyncing,
    syncError,
    handleSync,
    syncNow,
  }
}


