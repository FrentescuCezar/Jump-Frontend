"use client"

import { RefreshCw, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type SyncButtonProps = {
  isAnySyncing: boolean
  isFetching: boolean
  syncError: string | null
  onSync: () => void
  syncNow: (() => Promise<void>) | null
}

export function SyncButton({
  isAnySyncing,
  isFetching,
  syncError,
  onSync,
  syncNow,
}: SyncButtonProps) {
  return (
    <div className="flex items-center gap-2">
      {syncError && !isAnySyncing && (
        <Badge
          variant="destructive"
          className="gap-1"
          title={syncError}
        >
          <AlertTriangle className="h-3 w-3" />
          Sync failed
        </Badge>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={onSync}
        disabled={isAnySyncing || !syncNow}
        className="h-8 gap-2 rounded-full border-white/20 bg-white/5 text-white/90 shadow-[0_15px_45px_rgba(3,7,18,0.55)] hover:bg-white/10  disabled:opacity-50"
      >
        <RefreshCw
          className={`h-4 w-4 ${isAnySyncing ? "animate-spin" : ""}`}
        />
        {isAnySyncing ? "Sync…" : "Sync"}
      </Button>
    </div>
  )
}

