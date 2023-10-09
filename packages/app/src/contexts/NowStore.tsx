import { DateTime } from 'luxon'
import { create } from 'zustand'

interface NowStore {
  now: DateTime
  interval: NodeJS.Timer
  updateNow: () => void
}

export const useNowStore = create<NowStore>((set, get) => ({
  now: DateTime.now(),
  interval: setInterval(() => get().updateNow(), 1000),
  updateNow: () => {
    set((state) => ({
      ...state,
      now: DateTime.now(),
    }))
  },
}))
