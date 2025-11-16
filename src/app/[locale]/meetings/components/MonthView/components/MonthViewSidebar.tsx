"use client"

import { X } from "lucide-react"
import { motion } from "motion/react"
import { getEventsForDate } from "../utils/getEventsForDate"
import { getEmailColor } from "../utils/getEmailColor"
import { formatTimeRange } from "@/features/calendar/utils/eventFormatting"
import { normalizeMeetingType } from "../utils/normalizeMeetingType"
import { normalizeBotStatus } from "../utils/normalizeBotStatus"
import { MeetingIcon } from "./MeetingIcon"
import { BotIcon } from "./BotIcon"
import type { MonthViewSidebarProps } from "../types"
import type { CalendarEvent } from "@/features/calendar/types"

export function MonthViewSidebar({
  selectedDate,
  events,
  onClose,
  onEventClick,
}: MonthViewSidebarProps) {
  const selectedDateEvents = getEventsForDate(events, selectedDate)

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      suppressHydrationWarning
      className="w-72 flex flex-col border-l border-white/10 bg-linear-to-b from-[#1b0f2b]/90 via-[#0b111c]/92 to-[#07121f]/95 backdrop-blur-2xl shadow-[0_-20px_80px_rgba(3,7,18,0.65)]"
    >
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold text-white">
            {selectedDate.toLocaleDateString("default", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </h2>
          <p className="text-sm text-gray-400">
            {selectedDateEvents.length} event
            {selectedDateEvents.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-full border border-white/10 p-2 text-gray-400 transition hover:bg-white/10"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-2">
        {selectedDateEvents.length === 0 ? (
          <p className="mt-8 text-center text-gray-500">
            No events scheduled
          </p>
        ) : (
          selectedDateEvents.map((event: CalendarEvent) => {
            const meetingType = normalizeMeetingType(event.meetingPlatform)
            const botStatus = normalizeBotStatus(event.botStatus)

            return (
              <div
                key={event.id}
                onClick={() => onEventClick(event)}
                className={`${getEmailColor(event.creatorEmail, event.calendarTitle)} rounded-lg p-2.5 cursor-pointer hover:opacity-90 transition-opacity relative`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-300 mb-1">
                      {formatTimeRange(event.startTime, event.endTime)}
                    </div>
                    <h3 className="font-semibold text-gray-200 text-sm leading-tight mb-1.5">
                      {event.title || "Untitled Event"}
                    </h3>
                    <div className="space-y-1">
                      {(event.creatorEmail || event.calendarTitle) && (
                        <div className="text-xs text-gray-400 truncate">
                          {event.creatorEmail || event.calendarTitle}
                        </div>
                      )}
                      {botStatus && (
                        <div className="text-xs text-gray-400">
                          Bot: {botStatus}
                        </div>
                      )}
                      {event.notetakerEnabled && event.meetingUrl && (
                        <div className="text-xs text-gray-400">
                          Notetaker: ON
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1.5 items-start shrink-0">
                    {meetingType && <MeetingIcon type={meetingType} size="large" />}
                    {botStatus && <BotIcon status={botStatus} size="large" />}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </motion.div>
  )
}

