"use client"

import { motion } from "motion/react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { CalendarEvent } from "@/features/calendar/types"
import type { MultiDayCalendarEvent } from "@/features/calendar/utils/multiDayEvents"
import { formatTimeRange } from "@/features/calendar/utils/eventFormatting"
import { getEventColor } from "@/features/calendar/utils/eventColors"
import { MeetingIcon } from "@/features/calendar/components/MeetingIcon"
import { BotIcon } from "@/features/calendar/components/BotIcon"
import { BOT_STATUS_COLORS } from "@/features/calendar/constants/botStatus"
import {
  EVENT_HORIZONTAL_PADDING,
  Z_INDEX_EVENT_BASE,
  EVENT_CARD_ROUNDED,
} from "@/features/calendar/constants/weekView"
import { ICON_SIZES } from "@/features/calendar/constants/icons"
import type { WeekEventCardProps } from "../types"

const STAGGER_PER_EVENT = 0.02
const MAX_STAGGER_DELAY = 0.4

const MEETING_TOOLTIP_META = {
  zoom: {
    title: "Zoom Meeting",
    description: "Launch the Zoom room linked with this invite.",
    eyebrow: "Video Platform",
    accent: "#4F7CFF",
  },
  teams: {
    title: "Microsoft Teams",
    description: "Join the Teams workspace directly from this card.",
    eyebrow: "Video Platform",
    accent: "#5B61D6",
  },
  meet: {
    title: "Google Meet",
    description: "Open the Google Meet room prepared for this call.",
    eyebrow: "Video Platform",
    accent: "#0F9D58",
  },
} as const

const BOT_TOOLTIP_META = {
  COMPLETED: {
    title: "Bot run completed",
    description: "Notes, tasks, and follow-ups are synced.",
    eyebrow: "AI Copilot",
  },
  CANCELED: {
    title: "Bot run canceled",
    description: "Automation was stopped for this meeting.",
    eyebrow: "AI Copilot",
  },
  UPCOMING: {
    title: "Bot run scheduled",
    description: "Notetaker will join before the call.",
    eyebrow: "AI Copilot",
  },
  DEFAULT: {
    title: "Bot status",
    description: "Your AI assistant is tracking this meeting.",
    eyebrow: "AI Copilot",
  },
} as const

type MeetingTooltipKey = keyof typeof MEETING_TOOLTIP_META
type BotTooltipKey = keyof typeof BOT_TOOLTIP_META

const getBotTooltipMeta = (status?: string) => {
  if (!status) return null
  const normalized = status.toUpperCase()
  const base =
    BOT_TOOLTIP_META[normalized as BotTooltipKey] ?? BOT_TOOLTIP_META.DEFAULT
  const accent =
    BOT_STATUS_COLORS[normalized as keyof typeof BOT_STATUS_COLORS] ??
    BOT_STATUS_COLORS.default

  return {
    ...base,
    accent,
  }
}

export function WeekEventCard({
  event,
  topPosition,
  height,
  leftOffset,
  rightOffset,
  zIndex,
  groupIdx,
  eventIdx,
  onClick,
}: WeekEventCardProps) {
  const meetingType =
    event.meetingPlatform === "ZOOM"
      ? "zoom"
      : event.meetingPlatform === "MICROSOFT_TEAMS"
        ? "teams"
        : event.meetingPlatform === "GOOGLE_MEET"
          ? "meet"
          : undefined

  const botStatus =
    event.botStatus === "DONE"
      ? "COMPLETED"
      : event.botStatus === "CANCELLED"
        ? "CANCELED"
        : event.botStatus
          ? "UPCOMING"
          : undefined

  // Get rounded corners class for multi-day segments (matches v0)
  const getRoundedClass = () => {
    if (event.isMultiDaySegment) {
      if (event.segmentType === "start") {
        return "rounded-t-2xl rounded-b-none" // Rounded top, square bottom
      } else if (event.segmentType === "end") {
        return "rounded-t-none rounded-b-2xl" // Square top, rounded bottom
      } else if (event.segmentType === "middle") {
        return "rounded-none" // Square all around
      }
    }
    return EVENT_CARD_ROUNDED // Default: rounded-2xl
  }

  // Get border class for multi-day segments (matches v0 - dashed borders)
  const getBorderClass = () => {
    if (event.isMultiDaySegment) {
      if (event.segmentType === "start") {
        return "border-t-2 border-l-2 border-r-2 border-dashed border-b-0"
      } else if (event.segmentType === "end") {
        return "border-b-2 border-l-2 border-r-2 border-dashed border-t-0"
      } else if (event.segmentType === "middle") {
        return "border-l-2 border-r-2 border-dashed border-t-0 border-b-0"
      }
    }
    return "border-2" // Default: solid border
  }

  const animationDelay = Math.min(
    (groupIdx + eventIdx) * STAGGER_PER_EVENT,
    MAX_STAGGER_DELAY,
  )

  const meetingTooltip = meetingType
    ? MEETING_TOOLTIP_META[meetingType as MeetingTooltipKey]
    : null
  const botTooltip = getBotTooltipMeta(botStatus)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.25,
        delay: animationDelay,
        ease: "easeOut",
      }}
      whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
      onClick={onClick}
      className={`absolute ${getRoundedClass()} ${getEventColor(event.creatorEmail, event.calendarTitle)} ${getBorderClass()} px-3 py-2 overflow-hidden cursor-pointer`}
      style={{
        top: `${topPosition}px`,
        height: `${height}px`,
        left: `${EVENT_HORIZONTAL_PADDING + leftOffset}px`,
        right: `${EVENT_HORIZONTAL_PADDING + rightOffset}px`,
        zIndex: Z_INDEX_EVENT_BASE + zIndex,
      }}
    >
      <div className="flex flex-col h-full gap-0.5">
        <div className="flex items-center justify-between shrink-0">
          <div className="text-xs opacity-70">
            {formatTimeRange(event.startTime, event.endTime)}
            {event.isMultiDaySegment && event.segmentType === "start" && (
              <span className="ml-2">→</span>
            )}
            {event.isMultiDaySegment && event.segmentType === "end" && (
              <span className="ml-2">←</span>
            )}
          </div>
          {(meetingTooltip || botTooltip) && (
            <div className="flex items-center gap-1.5">
              {meetingTooltip && meetingType && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      aria-label={`${meetingTooltip.title} link`}
                      className="inline-flex items-center justify-center transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      <MeetingIcon
                        type={meetingType}
                        size={ICON_SIZES.meeting.medium}
                      />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="end"
                    className="min-w-[190px] text-left"
                  >
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: meetingTooltip.accent }}
                        />
                        <span>{meetingTooltip.eyebrow}</span>
                      </div>
                      <p className="text-sm font-semiboMld text-white">
                        {meetingTooltip.title}
                      </p>
                      <p className="text-[12px] leading-snug text-white/75">
                        {meetingTooltip.description}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
              {botTooltip && botStatus && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      aria-label={`Bot status: ${botTooltip.title}`}
                      className="inline-flex items-center justify-center transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      <BotIcon
                        status={botStatus}
                        size={ICON_SIZES.bot.medium}
                      />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="end"
                    className="min-w-[190px] text-left"
                  >
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: botTooltip.accent }}
                        />
                        <span>{botTooltip.eyebrow}</span>
                      </div>
                      <p className="text-sm font-semibold text-white">
                        {botTooltip.title}
                      </p>
                      <p className="text-[12px] leading-snug text-white/75">
                        {botTooltip.description}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          )}
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
        {event.isMultiDaySegment && (
          <span className="text-xs opacity-60 italic">
            {event.segmentType === "start" && "Continues tomorrow"}
            {event.segmentType === "middle" && "Multi-day event"}
            {event.segmentType === "end" && "Linked with yesterday"}
          </span>
        )}
      </div>
    </motion.div>
  )
}
