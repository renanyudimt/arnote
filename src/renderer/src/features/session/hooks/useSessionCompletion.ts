import { useState, useCallback } from 'react'

import { ipc } from '@/lib/ipc'
import { useTranscriptionStore } from '@/stores/transcriptionStore'
import type { Session, TranscriptEntry, Summary } from '@/types/session'

interface UseSessionCompletionDeps {
  stop: () => Promise<void>
  generate: (transcript: TranscriptEntry[]) => Promise<void>
}

interface UseSessionCompletionReturn {
  showStopDialog: boolean
  setShowStopDialog: (open: boolean) => void
  sessionSaved: boolean
  handleStop: () => void
  handleConfirmStop: (generateSummary: boolean) => Promise<void>
}

export function useSessionCompletion({
  stop,
  generate
}: UseSessionCompletionDeps): UseSessionCompletionReturn {
  const entries = useTranscriptionStore((s) => s.entries)
  const [showStopDialog, setShowStopDialog] = useState(false)
  const [sessionSaved, setSessionSaved] = useState(false)

  const handleStop = (): void => {
    setShowStopDialog(true)
  }

  const handleConfirmStop = useCallback(
    async (generateSummary: boolean): Promise<void> => {
      setShowStopDialog(false)
      await stop()

      if (generateSummary) {
        await generate(entries)
      }

      const summary: Summary | null = generateSummary
        ? useTranscriptionStore.getState().summary
        : null

      const session: Session = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        endedAt: new Date().toISOString(),
        title: `Meeting ${new Date().toLocaleDateString()}`,
        transcript: entries,
        summary,
        status: 'completed',
        filePath: null
      }

      await ipc.session.save(session)
      setSessionSaved(true)
    },
    [entries, stop, generate]
  )

  return { showStopDialog, setShowStopDialog, sessionSaved, handleStop, handleConfirmStop }
}
