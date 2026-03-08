import { useState } from 'react'

import { useSettings } from './useSettings'

type ValidationState = 'idle' | 'loading' | 'valid' | 'invalid'

interface UseApiKeyInputReturn {
  keyInput: string
  showKey: boolean
  validationState: ValidationState
  validationError: string
  handleSaveKey: () => Promise<void>
  handleValidate: () => Promise<void>
  handleKeyInputChange: (value: string) => void
  toggleShowKey: () => void
}

export function useApiKeyInput(): UseApiKeyInputReturn {
  const { apiKey, isLoaded, setApiKey, validateApiKey } = useSettings()

  const [keyInput, setKeyInput] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [validationState, setValidationState] = useState<ValidationState>('idle')
  const [validationError, setValidationError] = useState('')
  const [keyInitialized, setKeyInitialized] = useState(false)

  if (isLoaded && !keyInitialized) {
    setKeyInput(apiKey)
    setKeyInitialized(true)
  }

  const handleSaveKey = async (): Promise<void> => {
    await setApiKey(keyInput.trim())
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
    showKey,
    validationState,
    validationError,
    handleSaveKey,
    handleValidate,
    handleKeyInputChange,
    toggleShowKey,
  }
}
