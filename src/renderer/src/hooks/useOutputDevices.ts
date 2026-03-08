import { useState, useEffect, useCallback, useRef } from 'react'

import { ipc } from '@/lib/ipc'
import type { OutputDevice } from '@/types/audio'

const POLL_INTERVAL_MS = 2000

interface UseOutputDevicesReturn {
  outputDevices: OutputDevice[]
  currentOutputDeviceId: number | null
  isLoading: boolean
  setOutputDevice: (id: number) => Promise<void>
}

export function useOutputDevices(): UseOutputDevicesReturn {
  const [outputDevices, setOutputDevices] = useState<OutputDevice[]>([])
  const [currentOutputDeviceId, setCurrentOutputDeviceId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchDevices = useCallback(async () => {
    try {
      const devices = await ipc.audio.getOutputDevices()
      setOutputDevices(devices)
    } catch {
      // Silently fail — devices may not be available on non-macOS
    }
  }, [])

  const fetchDefault = useCallback(async () => {
    try {
      const device = await ipc.audio.getDefaultOutputDevice()
      setCurrentOutputDeviceId(device.id)
    } catch {
      // Silently fail
    }
  }, [])

  useEffect(() => {
    const init = async (): Promise<void> => {
      await Promise.all([fetchDevices(), fetchDefault()])
      setIsLoading(false)
    }
    void init()
  }, [fetchDevices, fetchDefault])

  // Poll for default output changes (macOS may switch devices externally)
  useEffect(() => {
    pollRef.current = setInterval(() => {
      void fetchDefault()
    }, POLL_INTERVAL_MS)

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
      }
    }
  }, [fetchDefault])

  // Re-enumerate devices when hardware changes
  useEffect(() => {
    const handleDeviceChange = (): void => {
      void fetchDevices()
      void fetchDefault()
    }

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange)
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange)
    }
  }, [fetchDevices, fetchDefault])

  const setOutputDevice = useCallback(async (id: number) => {
    await ipc.audio.setOutputDevice(id)
    setCurrentOutputDeviceId(id)
  }, [])

  return { outputDevices, currentOutputDeviceId, isLoading, setOutputDevice }
}
