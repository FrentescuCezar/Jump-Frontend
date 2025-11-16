"use client"

import { Z_INDEX_CURRENT_TIME } from "@/features/calendar/constants/weekView"
import type { CurrentTimeIndicatorProps } from "../types"

export function CurrentTimeIndicator({
  currentTime,
  rowHeights,
  getCumulativeTop,
}: CurrentTimeIndicatorProps) {
  const top =
    getCumulativeTop(Math.floor(currentTime)) +
    (currentTime % 1) * rowHeights[Math.floor(currentTime)]

  return (
    <div
      className="absolute left-0 right-0 h-0.5 bg-red-500 pointer-events-none"
      style={{
        top: `${top}px`,
        zIndex: Z_INDEX_CURRENT_TIME,
      }}
    >
      <div className="absolute left-0 -top-1 w-2 h-2 bg-red-500 rounded-full" />
    </div>
  )
}


