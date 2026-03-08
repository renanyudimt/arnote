import { useEffect } from 'react'

import type { TranscriptionMode } from '@/lib/ipc'
import { useSettingsStore } from '@/stores/settingsStore'

interface UseSettingsReturn {
  apiKey: string
  transcriptionMode: TranscriptionMode
  isLoaded: boolean
  setApiKey: (key: string) => Promise<void>
  setTranscriptionMode: (mode: TranscriptionMode) => Promise<void>
  validateApiKey: (key: string) => Promise<{ valid: boolean; error?: string }>
}

export function useSettings(): UseSettingsReturn {
  const {
    apiKey,
    transcriptionMode,
    isLoaded,
    load,
    setApiKey,
    setTranscriptionMode,
    validateApiKey
  } = useSettingsStore()

  useEffect(() => {
    if (!isLoaded) {
      void load()
    }
  }, [isLoaded, load])

  return {
    apiKey,
    transcriptionMode,
    isLoaded,
    setApiKey,
    setTranscriptionMode,
    validateApiKey
  }
}
