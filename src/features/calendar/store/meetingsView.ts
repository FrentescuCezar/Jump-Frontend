import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export type ViewType = "week" | "month"

export type FilterState = {
  meetingPlatforms: string[]
  botStatuses: string[]
  emails: string[]
  searchQuery: string
  hourRange: { start: string; end: string } | null
  dateRange: { start: string | null; end: string | null }
}

type MeetingsViewState = {
  viewType: ViewType
  selectedDate: Date | null
  currentDate: Date
  filters: FilterState
  selectedEventId: string | null
}

type MeetingsViewActions = {
  setViewType: (view: ViewType) => void
  setSelectedDate: (date: Date | null) => void
  setCurrentDate: (date: Date) => void
  setFilters: (filters: Partial<FilterState>) => void
  resetFilters: () => void
  setSelectedEventId: (id: string | null) => void
  shiftMonth: (offset: number) => void
  shiftWeek: (offset: number) => void
}

const initialFilters: FilterState = {
  meetingPlatforms: [],
  botStatuses: [],
  emails: [],
  searchQuery: "",
  hourRange: null,
  dateRange: { start: null, end: null },
}

export const useMeetingsViewStore = create<
  MeetingsViewState & MeetingsViewActions
>()(
  persist(
    (set) => ({
      viewType: "month",
      selectedDate: null,
      currentDate: new Date(),
      filters: initialFilters,
      selectedEventId: null,

      setViewType: (view) => set({ viewType: view }),
      setSelectedDate: (date) => set({ selectedDate: date }),
      setCurrentDate: (date) => set({ currentDate: date }),
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),
      resetFilters: () => set({ filters: initialFilters }),
      setSelectedEventId: (id) => set({ selectedEventId: id }),
      shiftMonth: (offset) =>
        set((state) => {
          const newDate = new Date(state.currentDate)
          newDate.setMonth(newDate.getMonth() + offset)
          return { currentDate: newDate }
        }),
      shiftWeek: (offset) =>
        set((state) => {
          const newDate = new Date(state.currentDate)
          newDate.setDate(newDate.getDate() + offset * 7)
          return { currentDate: newDate }
        }),
    }),
    {
      name: "meetings-view-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        viewType: state.viewType,
        filters: state.filters,
      }),
      // Normalize rehydrated state: merge with initial filters to ensure all fields exist
      // This handles migration from old localStorage data that might be missing new fields
      onRehydrateStorage: () => (state) => {
        if (state?.filters) {
          // Merge persisted filters with initial values to fill in any missing fields
          state.filters = {
            ...initialFilters,
            ...state.filters,
          }
        }
      },
    },
  ),
)
