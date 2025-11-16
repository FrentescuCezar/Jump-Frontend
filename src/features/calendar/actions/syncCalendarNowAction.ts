"use server"

import { syncCalendarNow } from "@/features/calendar/api"
import type { CalendarSyncSummary } from "@/features/calendar/types"

export async function syncCalendarNowAction(): Promise<CalendarSyncSummary> {
  return syncCalendarNow()
}
