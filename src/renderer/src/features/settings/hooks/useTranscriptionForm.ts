import { useEffect } from 'react'

import { useForm } from 'react-hook-form'

import { useSettingsStore } from '@/stores/settingsStore'

interface OpenAITranscriptionFields {
  whisperModel: string
}

interface UseTranscriptionFormReturn {
  openAIForm: ReturnType<typeof useForm<OpenAITranscriptionFields>>
  handleSaveOpenAITranscription: () => Promise<void>
}

export function useTranscriptionForm(): UseTranscriptionFormReturn {
  const {
    isLoaded,
    whisperModel,
    setWhisperModel,
  } = useSettingsStore()

  const openAIForm = useForm<OpenAITranscriptionFields>({
    defaultValues: { whisperModel: '' },
  })

  useEffect(() => {
    if (isLoaded) {
      openAIForm.reset({ whisperModel })
    }
  }, [isLoaded]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveOpenAITranscription = openAIForm.handleSubmit(async (data) => {
    await setWhisperModel(data.whisperModel)
    openAIForm.reset(data)
  })

  return {
    openAIForm,
    handleSaveOpenAITranscription: () => handleSaveOpenAITranscription(),
  }
}
