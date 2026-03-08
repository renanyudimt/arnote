import { create } from 'zustand'

import { ipc } from '@/lib/ipc'
import type { TranscriptionMode } from '@/lib/ipc'

interface SettingsState {
  apiKey: string
  transcriptionMode: TranscriptionMode
  selectedMicDeviceId: string
  systemAudioSource: string
  isLoaded: boolean
  load: () => Promise<void>
  setApiKey: (key: string) => Promise<void>
  setTranscriptionMode: (mode: TranscriptionMode) => Promise<void>
  setSelectedMicDeviceId: (deviceId: string) => Promise<void>
  setSystemAudioSource: (source: string) => Promise<void>
  validateApiKey: (key: string) => Promise<{ valid: boolean; error?: string }>
}

export const useSettingsStore = create<SettingsState>((set) => ({
  apiKey: '',
  transcriptionMode: 'whisper',
  selectedMicDeviceId: '',
  systemAudioSource: 'loopback',
  isLoaded: false,

  load: async () => {
    const settings = await ipc.settings.get()
    set({
      apiKey: settings.openaiApiKey,
      transcriptionMode: settings.transcriptionMode,
      selectedMicDeviceId: settings.selectedMicDeviceId,
      systemAudioSource: settings.systemAudioSource,
      isLoaded: true
    })
  },

  setApiKey: async (key: string) => {
    await ipc.settings.setApiKey(key)
    set({ apiKey: key })
  },

  setTranscriptionMode: async (mode: TranscriptionMode) => {
    await ipc.settings.setMode(mode)
    set({ transcriptionMode: mode })
  },

  setSelectedMicDeviceId: async (deviceId: string) => {
    await ipc.settings.setMicDevice(deviceId)
    set({ selectedMicDeviceId: deviceId })
  },

  setSystemAudioSource: async (source: string) => {
    await ipc.settings.setSystemAudioSource(source)
    set({ systemAudioSource: source })
  },

  validateApiKey: async (key: string) => await ipc.settings.validateApiKey(key)
}))
