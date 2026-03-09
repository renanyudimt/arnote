import { useState, useCallback } from 'react'

import { useNavigate } from 'react-router-dom'

import { ipc } from '@/lib/ipc'
import { useSettingsStore } from '@/stores/settingsStore'
import { useTranscriptionStore } from '@/stores/transcriptionStore'
import type { Session, SummaryLanguage, ProcessingNavigationState } from '@/types/session'

interface UseSessionCompletionDeps {
  stop: () => Promise<void>
}

interface UseSessionCompletionReturn {
  showStopDialog: boolean
  completionError: string | null
  setShowStopDialog: (open: boolean) => void
  handleStop: () => void
  handleConfirmStop: (generateSummary: boolean, language?: SummaryLanguage) => Promise<void>
}

export function useSessionCompletion({
  stop
}: UseSessionCompletionDeps): UseSessionCompletionReturn {
  const entries = useTranscriptionStore((s) => s.entries)
  const reset = useTranscriptionStore((s) => s.reset)
  const navigate = useNavigate()
  const [showStopDialog, setShowStopDialog] = useState(false)
  const [completionError, setCompletionError] = useState<string | null>(null)

  const handleStop = (): void => {
    setShowStopDialog(true)
  }

  const handleConfirmStop = useCallback(
    async (generateSummary: boolean, language?: SummaryLanguage): Promise<void> => {
      setShowStopDialog(false)
      setCompletionError(null)

      try {
        await stop()

        if (generateSummary) {
          const { curationEnabled, curationGlossary } = useSettingsStore.getState()

          const state: ProcessingNavigationState = {
            transcript: entries,
            language: language ?? 'pt',
            curationEnabled,
            curationGlossary
          }

          void navigate('/session/processing', { state })
        } else {
          const session: Session = {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            endedAt: new Date().toISOString(),
            title: `Session ${new Date().toLocaleDateString()}`,
            transcript: entries,
            summary: null,
            status: 'completed',
            filePath: null
          }

          await ipc.session.save(session)
          reset()
          void navigate(`/session/${session.id}`, { replace: true })
        }
      } catch (err) {
        setCompletionError(err instanceof Error ? err.message : String(err))
      }
    },
    [entries, stop, reset, navigate]
  )

  return { showStopDialog, completionError, setShowStopDialog, handleStop, handleConfirmStop }
}
