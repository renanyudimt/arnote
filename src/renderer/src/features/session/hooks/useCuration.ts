import { useState, useCallback } from 'react'

import { ipc } from '@/lib/ipc'
import { useSettingsStore } from '@/stores/settingsStore'
import type { TranscriptEntry } from '@/types/session'

interface UseCurationReturn {
  isCurating: boolean
  curate: (transcript: TranscriptEntry[], language?: string) => Promise<TranscriptEntry[]>
}

export function useCuration(): UseCurationReturn {
  const [isCurating, setIsCurating] = useState(false)

  const curate = useCallback(
    async (transcript: TranscriptEntry[], language?: string): Promise<TranscriptEntry[]> => {
      const { curationEnabled, curationGlossary } = useSettingsStore.getState()

      if (!curationEnabled) {
        return transcript
      }

      setIsCurating(true)
      try {
        const curated = await ipc.curation.curate(transcript, language, curationGlossary)
        return curated
      } catch (error) {
        console.error('Curation failed, using raw transcript:', error)
        return transcript
      } finally {
        setIsCurating(false)
      }
    },
    []
  )

  return { isCurating, curate }
}
