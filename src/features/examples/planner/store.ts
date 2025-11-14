"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { formatISO } from "date-fns"

type PlannerState = {
  selectedDate: string
  showDescriptions: boolean
  pinnedTemplateId?: string
  selectDate: (date: string) => void
  toggleDescriptions: () => void
  setPinnedTemplate: (templateId?: string) => void
}

const today = formatISO(new Date(), { representation: "date" })

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set) => ({
      selectedDate: today,
      showDescriptions: true,
      pinnedTemplateId: undefined,
      selectDate: (date) => set({ selectedDate: date }),
      toggleDescriptions: () =>
        set((state) => ({ showDescriptions: !state.showDescriptions })),
      setPinnedTemplate: (templateId) => set({ pinnedTemplateId: templateId }),
    }),
    {
      name: "planner-storage", // localStorage key
      partialize: (state) => ({
        // Only persist selectedDate, not the other state
        selectedDate: state.selectedDate,
      }),
    },
  ),
)


