"use client"

import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { getEmailColor } from "../utils/getEmailColor"
import { normalizeMeetingType } from "../utils/normalizeMeetingType"
import { normalizeBotStatus } from "../utils/normalizeBotStatus"
import { MeetingIcon } from "./MeetingIcon"
import { BotIcon } from "./BotIcon"
import type { MonthEventCardProps } from "../types"

export function MonthEventCard({
  event,
  eventIdx,
  onEventClick,
}: MonthEventCardProps) {
  const meetingType = normalizeMeetingType(event.meetingPlatform)
  const botStatus = normalizeBotStatus(event.botStatus)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    setHasAnimated(true)
  }, [])

  return (
    <motion.div
      key={event.id}
      initial={
        hasAnimated
          ? false
          : {
              opacity: 0,
              x: -10,
            }
      }
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.3,
        delay: eventIdx * 0.05,
      }}
      onClick={(e) => {
        e.stopPropagation()
        onEventClick(event)
      }}
      suppressHydrationWarning
      className={`${getEmailColor(event.creatorEmail, event.calendarTitle)} rounded px-2.5 py-1.5 text-sm truncate flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity`}
    >
      {meetingType && <MeetingIcon type={meetingType} size="medium" />}
      {botStatus && <BotIcon status={botStatus} size="medium" />}
      <span className="truncate flex-1 font-medium text-gray-200">
        {event.title || "Untitled Event"}
      </span>
    </motion.div>
  )
}
