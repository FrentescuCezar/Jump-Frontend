"use client"

import { useState, useEffect, useRef } from "react"
import { UPDATE_TIME_INTERVAL_MS } from "@/features/calendar/constants/weekView"

/**
 * Custom hook for managing week view state and interactions
 */
export function useWeekView() {
  const [currentTime, setCurrentTime] = useState<number>(0)
  const calendarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.getHours() + now.getMinutes() / 60)
    }
    updateTime()
    const interval = setInterval(updateTime, UPDATE_TIME_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  return {
    currentTime,
    calendarRef,
  }
}

