"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

type ViewNavigationProps = {
  viewType: "week" | "month"
  onPrevious: () => void
  onToday: () => void
  onNext: () => void
  isLoading: boolean
}

export function ViewNavigation({
  viewType,
  onPrevious,
  onToday,
  onNext,
  isLoading,
}: ViewNavigationProps) {
  if (viewType === "month") return null

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrevious}
        className="h-8 w-8 rounded-full border-white/20 bg-white/5 p-0 text-white/90 shadow-[0_15px_45px_rgba(3,7,18,0.55)] hover:bg-white/10  disabled:opacity-50"
        disabled={isLoading}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onToday}
        className="h-8 rounded-full border-white/20 bg-white/5 px-3 text-xs text-white/90 shadow-[0_15px_45px_rgba(3,7,18,0.55)] hover:bg-white/10  disabled:opacity-50"
        disabled={isLoading}
      >
        Today
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onNext}
        className="h-8 w-8 rounded-full border-white/20 bg-white/5 p-0 text-white/90 shadow-[0_15px_45px_rgba(3,7,18,0.55)] hover:bg-white/10  disabled:opacity-50"
        disabled={isLoading}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  )
}

