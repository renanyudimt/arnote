import { create } from 'zustand'

import type { TranscriptEntry, Summary } from '@/types/session'

interface TranscriptionState {
  isRecording: boolean
  entries: TranscriptEntry[]
  summary: Summary | null
  isSummarizing: boolean
  error: string | null
  setRecording: (recording: boolean) => void
  addEntry: (entry: TranscriptEntry) => void
  setEntries: (entries: TranscriptEntry[]) => void
  setSummary: (summary: Summary | null) => void
  setSummarizing: (summarizing: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useTranscriptionStore = create<TranscriptionState>((set) => ({
  isRecording: false,
  entries: [],
  summary: null,
  isSummarizing: false,
  error: null,
  setRecording: (isRecording) => set({ isRecording }),
  addEntry: (entry) =>
    set((state) => {
      const last = state.entries[state.entries.length - 1]
      if (last && last.text === entry.text && Math.abs(entry.timestamp - last.timestamp) < 2000) {
        return state
      }
      return { entries: [...state.entries, entry] }
    }),
  setEntries: (entries) => set({ entries }),
  setSummary: (summary) => set({ summary }),
  setSummarizing: (isSummarizing) => set({ isSummarizing }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      isRecording: false,
      entries: [],
      summary: null,
      isSummarizing: false,
      error: null
    })
}))
