"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { MonthViewHeaderProps } from "../types"

export function MonthViewHeader({
  monthName,
  year,
  onMonthChange,
  isLoading,
}: MonthViewHeaderProps) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-white/5/70 px-6 py-5 backdrop-blur-2xl shadow-[0_20px_40px_rgba(3,7,18,0.45)]">
      <h2 className="text-2xl font-bold text-gray-50">
        {monthName} {year}
      </h2>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onMonthChange(-1)}
          className="h-9 w-9 rounded-full border-white/20 bg-white/5 p-0 text-white/90 shadow-[0_15px_45px_rgba(3,7,18,0.55)] hover:bg-white/10 backdrop-blur-2xl disabled:opacity-50"
          disabled={isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onMonthChange(0)}
          className="h-9 rounded-full border-white/20 bg-white/5 px-4 text-white/90 shadow-[0_15px_45px_rgba(3,7,18,0.55)] hover:bg-white/10 backdrop-blur-2xl disabled:opacity-50"
          disabled={isLoading}
        >
          Today
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onMonthChange(1)}
          className="h-9 w-9 rounded-full border-white/20 bg-white/5 p-0 text-white/90 shadow-[0_15px_45px_rgba(3,7,18,0.55)] hover:bg-white/10 backdrop-blur-2xl disabled:opacity-50"
          disabled={isLoading}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
