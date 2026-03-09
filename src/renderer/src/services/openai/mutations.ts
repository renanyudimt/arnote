import { useMutation } from '@tanstack/react-query'

import { ipc } from '@/lib/ipc'

import { openaiKeys } from './keys'

import type { CurationInput, CurationOutput, SummaryInput, SummaryOutput } from './types'

export function useCurationMutation() {
  return useMutation<CurationOutput, Error, CurationInput>({
    mutationKey: openaiKeys.curation(),
    mutationFn: ({ transcript, language, glossary }) =>
      ipc.curation.curate(transcript, language, glossary)
  })
}

export function useSummaryMutation() {
  return useMutation<SummaryOutput, Error, SummaryInput>({
    mutationKey: openaiKeys.summary(),
    mutationFn: ({ transcript, language }) => ipc.summary.generate(transcript, language)
  })
}
