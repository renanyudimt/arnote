import { useState, useEffect, useCallback } from 'react'

const VIRTUAL_AUDIO_KEYWORDS = ['blackhole', 'loopback', 'virtual', 'soundflower', 'vb-audio']

interface AudioDevices {
  micDevices: MediaDeviceInfo[]
  inputDevices: MediaDeviceInfo[]
  systemAudioDevices: MediaDeviceInfo[]
  defaultMicDeviceId: string
  defaultSystemAudioDeviceId: string | null
  isLoading: boolean
  refresh: () => Promise<void>
}

export function useAudioDevices(): AudioDevices {
  const [micDevices, setMicDevices] = useState<MediaDeviceInfo[]>([])
  const [inputDevices, setInputDevices] = useState<MediaDeviceInfo[]>([])
  const [systemAudioDevices, setSystemAudioDevices] = useState<MediaDeviceInfo[]>([])
  const [defaultMicDeviceId, setDefaultMicDeviceId] = useState('')
  const [defaultSystemAudioDeviceId, setDefaultSystemAudioDeviceId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()

      const mics = devices.filter((d) => d.kind === 'audioinput')
      const inputs = devices.filter((d) => d.kind === 'audioinput')
      const outputs = devices.filter((d) => d.kind === 'audiooutput')

      const virtualInputs = inputs.filter((d) => {
        const label = d.label.toLowerCase()
        return VIRTUAL_AUDIO_KEYWORDS.some((keyword) => label.includes(keyword))
      })

      setMicDevices(mics)
      setInputDevices(inputs)
      setSystemAudioDevices(virtualInputs)
      setDefaultSystemAudioDeviceId(virtualInputs.length > 0 ? virtualInputs[0].deviceId : null)

      // Auto-detect best mic by matching groupId of default output device
      const defaultOutput = outputs.find((d) => d.deviceId === 'default')
      if (defaultOutput) {
        const matchingMic = mics.find(
          (m) => m.groupId === defaultOutput.groupId && m.deviceId !== 'default'
        )
        if (matchingMic) {
          setDefaultMicDeviceId(matchingMic.deviceId)
          return
        }
      }

      // Fallback: use the default mic
      const defaultMic = mics.find((d) => d.deviceId === 'default')
      if (defaultMic) {
        setDefaultMicDeviceId('default')
      } else if (mics.length > 0) {
        setDefaultMicDeviceId(mics[0].deviceId)
      }
    } catch (error) {
      console.warn('Failed to enumerate audio devices:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()

    const handleDeviceChange = (): void => {
      void refresh()
    }

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange)
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange)
    }
  }, [refresh])

  return { micDevices, inputDevices, systemAudioDevices, defaultMicDeviceId, defaultSystemAudioDeviceId, isLoading, refresh }
}
