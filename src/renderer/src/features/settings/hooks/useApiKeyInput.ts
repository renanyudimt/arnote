import { useState } from 'react'

import { useSettingsStore } from '@/stores/settingsStore'

type ValidationState = 'idle' | 'loading' | 'valid' | 'invalid'

interface UseApiKeyInputReturn {
  keyInput: string
  maskedApiKey: string
  hasApiKey: boolean
  showKey: boolean
  validationState: ValidationState
  validationError: string
  handleSaveKey: () => Promise<void>
  handleValidate: () => Promise<void>
  handleKeyInputChange: (value: string) => void
  toggleShowKey: () => void
}

export function useApiKeyInput(): UseApiKeyInputReturn {
  const { hasApiKey, maskedApiKey, setApiKey, validateApiKey } = useSettingsStore()

  const [keyInput, setKeyInput] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [validationState, setValidationState] = useState<ValidationState>('idle')
  const [validationError, setValidationError] = useState('')

  const handleSaveKey = async (): Promise<void> => {
    await setApiKey(keyInput.trim())
    setKeyInput('')
    setValidationState('idle')
  }

  const handleValidate = async (): Promise<void> => {
    const key = keyInput.trim()
    if (!key) return

    setValidationState('loading')
    const result = await validateApiKey(key)

    if (result.valid) {
      setValidationState('valid')
      setValidationError('')
      await setApiKey(key)
      setKeyInput('')
    } else {
      setValidationState('invalid')
      setValidationError(result.error ?? 'Invalid API key')
    }
  }

  const handleKeyInputChange = (value: string): void => {
    setKeyInput(value)
    setValidationState('idle')
  }

  const toggleShowKey = (): void => setShowKey((prev) => !prev)

  return {
    keyInput,
    maskedApiKey,
    hasApiKey,
    showKey,
    validationState,
    validationError,
    handleSaveKey,
    handleValidate,
    handleKeyInputChange,
    toggleShowKey,
  }
}
