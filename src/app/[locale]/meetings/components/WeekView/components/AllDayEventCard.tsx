"use client"

import { motion } from "motion/react"
import { getEventColor } from "@/features/calendar/utils/eventColors"
import {
  DAY_HEADER_HEIGHT,
  BASE_EVENT_HEIGHT,
  EVENT_HORIZONTAL_PADDING,
  Z_INDEX_EVENT_BASE,
} from "@/features/calendar/constants/weekView"
import type { AllDayEventCardProps } from "../types"

const ALL_DAY_STAGGER_PER_EVENT = 0.03
const ALL_DAY_MAX_DELAY = 0.3

export function AllDayEventCard({
  event,
  index,
  onEventClick,
}: AllDayEventCardProps) {
  const animationDelay = Math.min(index * ALL_DAY_STAGGER_PER_EVENT, ALL_DAY_MAX_DELAY)

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.25,
        delay: animationDelay,
        ease: "easeOut",
      }}
      className={`absolute rounded-2xl border-2 ${getEventColor(event.creatorEmail, event.calendarTitle)} px-3 py-2 overflow-hidden cursor-pointer`}
      style={{
        top: `${DAY_HEADER_HEIGHT + index * (BASE_EVENT_HEIGHT + 4)}px`,
        height: `${BASE_EVENT_HEIGHT}px`,
        left: `${EVENT_HORIZONTAL_PADDING}px`,
        right: `${EVENT_HORIZONTAL_PADDING}px`,
        zIndex: Z_INDEX_EVENT_BASE + 1,
      }}
      onClick={() => onEventClick(event)}
    >
      <div className="flex flex-col h-full gap-0.5">
        <div className="flex items-center justify-between shrink-0">
          <span className="text-xs opacity-70">All-day</span>
        </div>
        <div className="flex-1 min-h-0">
          <span className="text-sm font-semibold leading-tight block">
            {event.title || "Untitled Event"}
          </span>
          {(event.creatorEmail || event.calendarTitle) && (
            <span className="text-xs opacity-70 block mt-0.5">
              {event.creatorEmail || event.calendarTitle}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

