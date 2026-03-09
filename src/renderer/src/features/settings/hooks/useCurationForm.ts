import { useState } from 'react'

import { useForm } from 'react-hook-form'

import { useSettingsStore } from '@/stores/settingsStore'

interface OpenAICurationFields {
  curationModel: string
}

interface UseCurationFormReturn {
  curationEnabled: boolean
  glossaryInput: string
  handleToggleCuration: () => Promise<void>
  handleGlossaryChange: (value: string) => void
  handleSaveGlossary: () => Promise<void>
  glossaryDirty: boolean
  openAIForm: ReturnType<typeof useForm<OpenAICurationFields>>
  handleSaveOpenAICuration: () => Promise<void>
}

export function useCurationForm(): UseCurationFormReturn {
  const {
    isLoaded,
    curationEnabled,
    curationModel,
    curationGlossary,
    setCurationEnabled,
    setCurationGlossary,
    setCurationModel,
    setCurationProvider,
  } = useSettingsStore()

  const [glossaryInput, setGlossaryInput] = useState('')
  const [initialized, setInitialized] = useState(false)

  const openAIForm = useForm<OpenAICurationFields>({
    defaultValues: { curationModel: '' },
  })

  if (isLoaded && !initialized) {
    setGlossaryInput(curationGlossary.join('\n'))
    openAIForm.reset({ curationModel })
    setInitialized(true)
  }

  const handleToggleCuration = async (): Promise<void> => {
    await setCurationEnabled(!curationEnabled)
  }

  const handleGlossaryChange = (value: string): void => {
    setGlossaryInput(value)
  }

  const parseGlossary = (input: string): string[] =>
    input
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

  const handleSaveGlossary = async (): Promise<void> => {
    const glossary = parseGlossary(glossaryInput)
    await setCurationGlossary(glossary)
  }

  const handleSaveOpenAICuration = openAIForm.handleSubmit(async (data) => {
    await setCurationModel(data.curationModel)
    await setCurationProvider('openai')
    await setCurationEnabled(true)
    openAIForm.reset(data)
  })

  const currentGlossary = parseGlossary(glossaryInput)
  const glossaryDirty = JSON.stringify(currentGlossary) !== JSON.stringify(curationGlossary)

  return {
    curationEnabled,
    glossaryInput,
    handleToggleCuration,
    handleGlossaryChange,
    handleSaveGlossary,
    glossaryDirty,
    openAIForm,
    handleSaveOpenAICuration: () => handleSaveOpenAICuration(),
  }
}
