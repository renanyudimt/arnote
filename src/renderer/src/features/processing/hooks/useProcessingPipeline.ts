import { useState, useEffect, useRef, useCallback } from 'react'

import { useNavigate } from 'react-router-dom'

import { ipc } from '@/lib/ipc'
import { useCurationMutation, useSummaryMutation } from '@/services/openai'
import { useTranscriptionStore } from '@/stores/transcriptionStore'
import type { ProcessingNavigationState } from '@/types/session'

import { STEP_IDS, STEP_LABELS } from '../constants'

import type { PipelineStepState } from '../components/PipelineProgress/types'
import type { StepStatus } from '../components/PipelineStep/types'

interface UseProcessingPipelineReturn {
  steps: PipelineStepState[]
  hasError: boolean
}

function buildInitialSteps(curationEnabled: boolean): PipelineStepState[] {
  const steps: PipelineStepState[] = []

  if (curationEnabled) {
    steps.push({
      id: STEP_IDS.CURATION,
      label: STEP_LABELS[STEP_IDS.CURATION],
      status: 'pending'
    })
  }

  steps.push({
    id: STEP_IDS.SUMMARY,
    label: STEP_LABELS[STEP_IDS.SUMMARY],
    status: 'pending'
  })

  steps.push({
    id: STEP_IDS.SAVING,
    label: STEP_LABELS[STEP_IDS.SAVING],
    status: 'pending'
  })

  return steps
}

export function useProcessingPipeline(
  state: ProcessingNavigationState
): UseProcessingPipelineReturn {
  const { transcript, language, curationEnabled, curationGlossary } = state
  const navigate = useNavigate()
  const reset = useTranscriptionStore((s) => s.reset)
  const hasStarted = useRef(false)

  const [steps, setSteps] = useState<PipelineStepState[]>(() =>
    buildInitialSteps(curationEnabled)
  )
  const [hasError, setHasError] = useState(false)

  const curationMutation = useCurationMutation()
  const summaryMutation = useSummaryMutation()

  const updateStep = useCallback((stepId: string, status: StepStatus, errorMessage?: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, status, errorMessage } : s))
    )
  }, [])

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    const run = async (): Promise<void> => {
      let finalTranscript = transcript

      // Step 1: Curation (if enabled)
      if (curationEnabled) {
        updateStep(STEP_IDS.CURATION, 'active')
        try {
          finalTranscript = await curationMutation.mutateAsync({
            transcript,
            language,
            glossary: curationGlossary
          })
          updateStep(STEP_IDS.CURATION, 'completed')
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Curation failed'
          updateStep(STEP_IDS.CURATION, 'error', message)
          setHasError(true)
          return
        }
      }

      // Step 2: Summary
      updateStep(STEP_IDS.SUMMARY, 'active')
      try {
        const summary = await summaryMutation.mutateAsync({
          transcript: finalTranscript,
          language
        })

        updateStep(STEP_IDS.SUMMARY, 'completed')

        // Step 3: Save
        updateStep(STEP_IDS.SAVING, 'active')
        const session = {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          endedAt: new Date().toISOString(),
          title: `Session ${new Date().toLocaleDateString()}`,
          transcript: finalTranscript,
          summary,
          status: 'completed' as const,
          filePath: null
        }

        await ipc.session.save(session)
        updateStep(STEP_IDS.SAVING, 'completed')

        reset()
        void navigate(`/session/${session.id}`, { replace: true })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Processing failed'
        const failedStep = summaryMutation.isError ? STEP_IDS.SUMMARY : STEP_IDS.SAVING
        updateStep(failedStep, 'error', message)
        setHasError(true)
      }
    }

    void run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { steps, hasError }
}
