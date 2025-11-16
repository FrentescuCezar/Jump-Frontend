import { useMemo } from "react"
import { getYear, getMonth } from "date-fns"

export function useMonthView(currentDate: Date) {
  return useMemo(() => {
    const year = getYear(currentDate)
    const monthIndex = getMonth(currentDate)

    const firstDay = new Date(year, monthIndex, 1)
    const lastDay = new Date(year, monthIndex + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1 // Monday = 0
    const monthName = firstDay.toLocaleString("default", { month: "long" })

    return {
      year,
      monthIndex,
      firstDay,
      lastDay,
      daysInMonth,
      startDayOfWeek,
      monthName,
    }
  }, [currentDate])
}
