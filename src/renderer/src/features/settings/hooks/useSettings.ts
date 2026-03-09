import { useEffect } from 'react'

import type { TranscriptionMode } from '@/lib/ipc'
import { useSettingsStore } from '@/stores/settingsStore'

interface UseSettingsReturn {
  hasApiKey: boolean
  transcriptionMode: TranscriptionMode
  isLoaded: boolean
  setTranscriptionMode: (mode: TranscriptionMode) => Promise<void>
  validateApiKey: (key: string) => Promise<{ valid: boolean; error?: string }>
}

export function useSettings(): UseSettingsReturn {
  const {
    hasApiKey,
    transcriptionMode,
    isLoaded,
    load,
    setTranscriptionMode,
    validateApiKey,
  } = useSettingsStore()

  useEffect(() => {
    if (!isLoaded) {
      void load()
    }
  }, [isLoaded, load])

  return {
    hasApiKey,
    transcriptionMode,
    isLoaded,
    setTranscriptionMode,
    validateApiKey,
  }
}
