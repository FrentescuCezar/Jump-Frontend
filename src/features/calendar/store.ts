"use client"

import { create } from "zustand"

type MeetingsState = {
  showNotetakerOnly: boolean
  setShowNotetakerOnly: (value: boolean) => void
}

export const useMeetingsStore = create<MeetingsState>((set) => ({
  showNotetakerOnly: false,
  setShowNotetakerOnly: (value) => set({ showNotetakerOnly: value }),
}))


