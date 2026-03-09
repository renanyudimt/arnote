import { create } from 'zustand'

import { ipc } from '@/lib/ipc'
import type { TranscriptionMode, SummaryProviderType, CurationProviderType } from '@/lib/ipc'

interface SettingsState {
  hasApiKey: boolean
  maskedApiKey: string
  transcriptionMode: TranscriptionMode
  selectedMicDeviceId: string
  systemAudioSource: string
  whisperModel: string
  summaryModel: string
  summaryProvider: SummaryProviderType
  curationEnabled: boolean
  curationProvider: CurationProviderType
  curationModel: string
  curationGlossary: string[]
  isLoaded: boolean
  load: () => Promise<void>
  setApiKey: (key: string) => Promise<void>
  setTranscriptionMode: (mode: TranscriptionMode) => Promise<void>
  setSelectedMicDeviceId: (deviceId: string) => Promise<void>
  setSystemAudioSource: (source: string) => Promise<void>
  setWhisperModel: (model: string) => Promise<void>
  setSummaryModel: (model: string) => Promise<void>
  setSummaryProvider: (provider: SummaryProviderType) => Promise<void>
  setCurationEnabled: (enabled: boolean) => Promise<void>
  setCurationProvider: (provider: CurationProviderType) => Promise<void>
  setCurationModel: (model: string) => Promise<void>
  setCurationGlossary: (glossary: string[]) => Promise<void>
  validateApiKey: (key: string) => Promise<{ valid: boolean; error?: string }>
  refreshApiKeyStatus: () => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set) => ({
  hasApiKey: false,
  maskedApiKey: '',
  transcriptionMode: 'whisper',
  selectedMicDeviceId: '',
  systemAudioSource: 'loopback',
  whisperModel: 'whisper-1',
  summaryModel: 'gpt-4o',
  summaryProvider: 'openai',
  curationEnabled: false,
  curationProvider: 'openai',
  curationModel: 'gpt-4o-mini',
  curationGlossary: [],
  isLoaded: false,

  load: async () => {
    const [settings, keyStatus] = await Promise.all([
      ipc.settings.get(),
      ipc.settings.getApiKeyStatus()
    ])
    set({
      hasApiKey: settings.hasApiKey,
      maskedApiKey: keyStatus.maskedKey,
      transcriptionMode: settings.transcriptionMode,
      selectedMicDeviceId: settings.selectedMicDeviceId,
      systemAudioSource: settings.systemAudioSource,
      whisperModel: settings.whisperModel,
      summaryModel: settings.summaryModel,
      summaryProvider: settings.summaryProvider,
      curationEnabled: settings.curationEnabled,
      curationProvider: settings.curationProvider,
      curationModel: settings.curationModel,
      curationGlossary: settings.curationGlossary,
      isLoaded: true
    })
  },

  setApiKey: async (key: string) => {
    await ipc.settings.setApiKey(key)
    const keyStatus = await ipc.settings.getApiKeyStatus()
    set({ hasApiKey: keyStatus.hasKey, maskedApiKey: keyStatus.maskedKey })
  },

  refreshApiKeyStatus: async () => {
    const keyStatus = await ipc.settings.getApiKeyStatus()
    set({ hasApiKey: keyStatus.hasKey, maskedApiKey: keyStatus.maskedKey })
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

  setWhisperModel: async (model: string) => {
    await ipc.settings.setWhisperModel(model)
    set({ whisperModel: model })
  },

  setSummaryModel: async (model: string) => {
    await ipc.settings.setSummaryModel(model)
    set({ summaryModel: model })
  },

  setSummaryProvider: async (provider: SummaryProviderType) => {
    await ipc.settings.setSummaryProvider(provider)
    set({ summaryProvider: provider })
  },

  setCurationEnabled: async (enabled: boolean) => {
    await ipc.settings.setCurationEnabled(enabled)
    set({ curationEnabled: enabled })
  },

  setCurationProvider: async (provider: CurationProviderType) => {
    await ipc.settings.setCurationProvider(provider)
    set({ curationProvider: provider })
  },

  setCurationModel: async (model: string) => {
    await ipc.settings.setCurationModel(model)
    set({ curationModel: model })
  },

  setCurationGlossary: async (glossary: string[]) => {
    await ipc.settings.setCurationGlossary(glossary)
    set({ curationGlossary: glossary })
  },

  validateApiKey: async (key: string) => await ipc.settings.validateApiKey(key)
}))
