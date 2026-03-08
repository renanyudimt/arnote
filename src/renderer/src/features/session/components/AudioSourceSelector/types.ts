import type { SystemAudioSource } from '@/lib/audio'
import type { OutputDevice } from '@/types/audio'

export interface AudioSourceSelectorProps {
  micDeviceId: string
  systemAudioSource: SystemAudioSource
  isNativeCapture?: boolean
  outputDevices: OutputDevice[]
  outputDeviceId: number | null
  isOutputLoading?: boolean
  onMicDeviceChange: (deviceId: string) => void
  onSystemAudioSourceChange: (source: SystemAudioSource) => void
  onOutputDeviceChange: (id: number) => void
}
