import { useMemo, useEffect } from 'react'

import { useAudioDevices } from '@/hooks/useAudioDevices'
import type { SystemAudioSource } from '@/lib/audio'
import { useSettingsStore } from '@/stores/settingsStore'

interface UseAudioDeviceHandlersReturn {
  selectedMicDeviceId: string
  currentSystemAudioSource: SystemAudioSource
  handleMicDeviceChange: (deviceId: string) => void
  handleSystemAudioSourceChange: (source: SystemAudioSource) => void
}

export function useAudioDeviceHandlers(): UseAudioDeviceHandlersReturn {
  const { systemAudioSource, selectedMicDeviceId } = useSettingsStore()
  const { defaultSystemAudioDeviceId } = useAudioDevices()

  useEffect(() => {
    if (defaultSystemAudioDeviceId && systemAudioSource === 'loopback') {
      void useSettingsStore.getState().setSystemAudioSource(defaultSystemAudioDeviceId)
    }
  }, [defaultSystemAudioDeviceId, systemAudioSource])

  const currentSystemAudioSource: SystemAudioSource = useMemo(
    () =>
      systemAudioSource === 'loopback' || !systemAudioSource
        ? 'loopback'
        : { deviceId: systemAudioSource },
    [systemAudioSource]
  )

  const handleMicDeviceChange = (deviceId: string): void => {
    void useSettingsStore.getState().setSelectedMicDeviceId(deviceId)
  }

  const handleSystemAudioSourceChange = (source: SystemAudioSource): void => {
    const persistValue = source === 'loopback' ? 'loopback' : source.deviceId
    void useSettingsStore.getState().setSystemAudioSource(persistValue)
  }

  return {
    selectedMicDeviceId,
    currentSystemAudioSource,
    handleMicDeviceChange,
    handleSystemAudioSourceChange
  }
}
