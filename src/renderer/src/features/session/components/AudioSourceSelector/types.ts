import type { SystemAudioSource } from '@/lib/audio'

export interface AudioSourceSelectorProps {
  micDeviceId: string
  systemAudioSource: SystemAudioSource
  isNativeCapture?: boolean
  onMicDeviceChange: (deviceId: string) => void
  onSystemAudioSourceChange: (source: SystemAudioSource) => void
}
