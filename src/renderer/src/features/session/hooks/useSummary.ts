import { useCallback } from 'react'

import { ipc } from '@/lib/ipc'
import { useTranscriptionStore } from '@/stores/transcriptionStore'
import type { TranscriptEntry, Summary } from '@/types/session'

export function useSummary(): {
  summary: Summary | null
  isSummarizing: boolean
  generate: (transcript: TranscriptEntry[], language?: string) => Promise<void>
} {
  const { summary, isSummarizing, setSummary, setSummarizing } = useTranscriptionStore()

  const generate = useCallback(
    async (transcript: TranscriptEntry[], language?: string) => {
      setSummarizing(true)
      try {
        const result = await ipc.summary.generate(transcript, language)
        setSummary(result)
      } catch (error) {
        console.error('Failed to generate summary:', error)
      } finally {
        setSummarizing(false)
      }
    },
    [setSummarizing, setSummary]
  )

  return { summary, isSummarizing, generate }
}
