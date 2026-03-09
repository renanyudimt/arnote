import { useState } from 'react'

import { useForm } from 'react-hook-form'

import { useSettingsStore } from '@/stores/settingsStore'

interface OpenAISummaryFields {
  summaryModel: string
}

interface UseSummaryFormReturn {
  openAIForm: ReturnType<typeof useForm<OpenAISummaryFields>>
  handleSaveOpenAISummary: () => Promise<void>
}

export function useSummaryForm(): UseSummaryFormReturn {
  const {
    isLoaded,
    summaryModel,
    setSummaryModel,
    setSummaryProvider,
  } = useSettingsStore()

  const openAIForm = useForm<OpenAISummaryFields>({
    defaultValues: { summaryModel: '' },
  })

  const [formInitialized, setFormInitialized] = useState(false)

  if (isLoaded && !formInitialized) {
    openAIForm.reset({ summaryModel })
    setFormInitialized(true)
  }

  const handleSaveOpenAISummary = openAIForm.handleSubmit(async (data) => {
    await setSummaryModel(data.summaryModel)
    await setSummaryProvider('openai')
    openAIForm.reset(data)
  })

  return {
    openAIForm,
    handleSaveOpenAISummary: () => handleSaveOpenAISummary(),
  }
}
