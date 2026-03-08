import { Mic, Monitor } from 'lucide-react'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useAudioDevices } from '@/hooks/useAudioDevices'
import type { SystemAudioSource } from '@/lib/audio'

import type { AudioSourceSelectorProps } from './types'

function getDeviceLabel(device: MediaDeviceInfo, index: number): string {
  if (device.label) return device.label
  return device.kind === 'audiooutput' ? `Speaker ${index + 1}` : `Microphone ${index + 1}`
}

export function AudioSourceSelector({
  micDeviceId,
  systemAudioSource,
  isNativeCapture,
  onMicDeviceChange,
  onSystemAudioSourceChange
}: AudioSourceSelectorProps): React.JSX.Element {
  const { micDevices, systemAudioDevices, isLoading } = useAudioDevices()

  const systemAudioValue =
    systemAudioSource === 'loopback' ? 'loopback' : systemAudioSource.deviceId

  const handleSystemAudioChange = (value: string): void => {
    if (value === 'loopback') {
      onSystemAudioSourceChange('loopback')
    } else {
      onSystemAudioSourceChange({ deviceId: value } as SystemAudioSource)
    }
  }

  if (isLoading)
    return <div className="px-4 py-2 text-xs text-muted-foreground">Loading audio devices...</div>

  return (
    <div className="flex gap-4 border-b px-4 py-3">
      <div className="flex flex-1 flex-col gap-1.5">
        <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Mic className="size-3" />
          Microphone
        </Label>
        <Select value={micDeviceId} onValueChange={onMicDeviceChange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Select microphone" />
          </SelectTrigger>
          <SelectContent>
            {micDevices.map((device, i) => (
              <SelectItem key={device.deviceId} value={device.deviceId} className="text-xs">
                {getDeviceLabel(device, i)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!isNativeCapture && (
        <div className="flex flex-1 flex-col gap-1.5">
          <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Monitor className="size-3" />
            System Audio
          </Label>
          <Select value={systemAudioValue} onValueChange={handleSystemAudioChange}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="loopback" className="text-xs">
                System Audio (loopback)
              </SelectItem>
              {systemAudioDevices.length > 0 && <SelectSeparator />}
              {systemAudioDevices.map((device, i) => (
                <SelectItem key={device.deviceId} value={device.deviceId} className="text-xs">
                  {getDeviceLabel(device, i)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
