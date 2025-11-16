"use client"

import { create } from "zustand"

type MeetingsState = {
  showNotetakerOnly: boolean
  setShowNotetakerOnly: (value: boolean) => void
  activeTab: "upcoming" | "past"
  setActiveTab: (value: "upcoming" | "past") => void
}

export const useMeetingsStore = create<MeetingsState>((set) => ({
  showNotetakerOnly: false,
  setShowNotetakerOnly: (value) => set({ showNotetakerOnly: value }),
  activeTab: "upcoming",
  setActiveTab: (activeTab) => set({ activeTab }),
}))


