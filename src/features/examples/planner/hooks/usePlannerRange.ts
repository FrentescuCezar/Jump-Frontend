import { useState } from "react"
import { addMonths, endOfMonth, format, formatISO, startOfMonth } from "date-fns"
import type { PlannerRangeInput } from "@/schemas/examples/planner"

export function usePlannerRange(initialRange: PlannerRangeInput) {
  const [range, setRange] = useState(initialRange)

  const shiftMonth = (delta: number) => {
    setRange((prev) => {
      const base = addMonths(new Date(prev.start), delta)
      return {
        ...prev,
        start: formatISO(startOfMonth(base), { representation: "date" }),
        end: formatISO(endOfMonth(base), { representation: "date" }),
      }
    })
  }

  const rangeLabel = `${format(new Date(range.start), "MMM d")} – ${format(
    new Date(range.end),
    "MMM d",
  )}`

  return {
    range,
    shiftMonth,
    rangeLabel,
  }
}

