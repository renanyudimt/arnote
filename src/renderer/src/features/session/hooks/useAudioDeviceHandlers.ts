import { useMemo, useEffect } from 'react'

import { useAudioDevices } from '@/hooks/useAudioDevices'
import { useOutputDevices } from '@/hooks/useOutputDevices'
import type { SystemAudioSource } from '@/lib/audio'
import { useSettingsStore } from '@/stores/settingsStore'
import type { OutputDevice } from '@/types/audio'

interface UseAudioDeviceHandlersReturn {
  selectedMicDeviceId: string
  currentSystemAudioSource: SystemAudioSource
  outputDevices: OutputDevice[]
  selectedOutputDeviceId: number | null
  isOutputLoading: boolean
  handleMicDeviceChange: (deviceId: string) => void
  handleSystemAudioSourceChange: (source: SystemAudioSource) => void
  handleOutputDeviceChange: (id: number) => void
}

export function useAudioDeviceHandlers(): UseAudioDeviceHandlersReturn {
  const { systemAudioSource, selectedMicDeviceId } = useSettingsStore()
  const { defaultMicDeviceId, defaultSystemAudioDeviceId } = useAudioDevices()
  const {
    outputDevices,
    currentOutputDeviceId,
    isLoading: isOutputLoading,
    setOutputDevice
  } = useOutputDevices()

  useEffect(() => {
    if (defaultMicDeviceId && !selectedMicDeviceId) {
      void useSettingsStore.getState().setSelectedMicDeviceId(defaultMicDeviceId)
    }
  }, [defaultMicDeviceId, selectedMicDeviceId])

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

  const handleOutputDeviceChange = (id: number): void => {
    void setOutputDevice(id)
  }

  return {
    selectedMicDeviceId,
    currentSystemAudioSource,
    outputDevices,
    selectedOutputDeviceId: currentOutputDeviceId,
    isOutputLoading,
    handleMicDeviceChange,
    handleSystemAudioSourceChange,
    handleOutputDeviceChange
  }
}
