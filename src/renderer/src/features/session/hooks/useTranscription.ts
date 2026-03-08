import { useState, useEffect, useCallback, useRef } from 'react'

import { AudioCaptureRenderer } from '@/lib/audio'
import type { StartOptions } from '@/lib/audio'
import { ipc } from '@/lib/ipc'
import { useSettingsStore } from '@/stores/settingsStore'
import { useTranscriptionStore } from '@/stores/transcriptionStore'
import type { TranscriptEntry } from '@/types/session'

export function useTranscription(): {
  isRecording: boolean
  entries: TranscriptEntry[]
  error: string | null
  isMicMuted: boolean
  systemAudioSilent: boolean
  audioLevel: number
  isNativeCapture: boolean
  start: (options?: StartOptions) => Promise<void>
  stop: () => Promise<void>
  toggleMicMute: () => void
} {
  const { isRecording, entries, error, setRecording, addEntry, setError } = useTranscriptionStore()
  const audioCaptureRef = useRef<AudioCaptureRenderer | null>(null)
  const [isMicMuted, setIsMicMuted] = useState(false)
  const [systemAudioSilent, setSystemAudioSilent] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [isNativeCapture, setIsNativeCapture] = useState(false)
  const isMicMutedRef = useRef(false)
  const isNativeCaptureRef = useRef(false)

  useEffect(() => {
    const unsubChunk = ipc.transcription.onChunk((entry) => {
      addEntry(entry)
    })
    const unsubError = ipc.transcription.onError((err) => {
      setError(err)
    })

    return () => {
      unsubChunk()
      unsubError()
    }
  }, [addEntry, setError])

  // Listen for native audio events (silence, level, error) from main process
  useEffect(() => {
    const unsubSilence = ipc.audio.onNativeSilence((isSilent) => {
      setSystemAudioSilent(isSilent)
    })
    const unsubLevel = ipc.audio.onNativeLevel((level) => {
      setAudioLevel(level)
    })
    const unsubError = ipc.audio.onNativeError((err) => {
      setError(`Native audio error: ${err}`)
    })

    return () => {
      unsubSilence()
      unsubLevel()
      unsubError()
    }
  }, [setError])

  // Cleanup on unmount
  useEffect(() => () => {
      if (audioCaptureRef.current) {
        audioCaptureRef.current.stop().catch(console.error)
        audioCaptureRef.current = null
      }
      if (isNativeCaptureRef.current) {
        ipc.audio.stopNativeCapture().catch(console.error)
      }
    }, [])

  const start = useCallback(
    async (options?: StartOptions) => {
      setError(null)

      const { apiKey, transcriptionMode, isLoaded, load } = useSettingsStore.getState()
      if (!isLoaded) await load()

      const currentApiKey = isLoaded ? apiKey : useSettingsStore.getState().apiKey
      if (!currentApiKey) {
        setError('OpenAI API key not configured. Go to Settings to add your key.')
        return
      }

      const mode = isLoaded ? transcriptionMode : useSettingsStore.getState().transcriptionMode

      const nativeSupported = await ipc.audio.isNativeSupported()

      if (nativeSupported) {
        // Native path: AudioTee captures system audio in main process,
        // renderer only captures mic and sends chunks via IPC
        let nativeStarted = false
        try {
          await ipc.audio.startNativeCapture()
          isNativeCaptureRef.current = true
          setIsNativeCapture(true)
          nativeStarted = true
        } catch (err) {
          console.warn(
            `[useTranscription] Native capture failed to start: ${err instanceof Error ? err.message : String(err)}. Falling back to loopback.`
          )
        }

        if (nativeStarted) {
          const audioCapture = new AudioCaptureRenderer({
            onChunk: () => {},
            onMicChunk: (buffer) => {
              ipc.audio.sendMicChunk(buffer)
            }
          })

          try {
            await audioCapture.start({ micDeviceId: options?.micDeviceId, micOnly: true })
            audioCapture.setMicMuted(isMicMutedRef.current)
            audioCaptureRef.current = audioCapture
          } catch (err) {
            await ipc.audio.stopNativeCapture()
            isNativeCaptureRef.current = false
            setIsNativeCapture(false)
            setError(
              `Microphone capture failed: ${err instanceof Error ? err.message : String(err)}`
            )
            return
          }
        }
      }

      if (!isNativeCaptureRef.current) {
        setError(
          'Native audio capture is not available on this system. ' +
            'Check System Settings > Privacy & Security > Screen & System Audio Recording.'
        )
        return
      }

      // Start transcription in main process
      try {
        await ipc.transcription.start(mode)
        setRecording(true)
      } catch (err) {
        if (audioCaptureRef.current) {
          await audioCaptureRef.current.stop()
          audioCaptureRef.current = null
        }
        if (isNativeCaptureRef.current) {
          await ipc.audio.stopNativeCapture()
          isNativeCaptureRef.current = false
          setIsNativeCapture(false)
        }
        setError(`Transcription start failed: ${err instanceof Error ? err.message : String(err)}`)
      }
    },
    [setError, setRecording]
  )

  const stop = useCallback(async () => {
    // Stop transcription first so remaining chunks are processed
    await ipc.transcription.stop()

    // Stop audio capture
    if (audioCaptureRef.current) {
      await audioCaptureRef.current.stop()
      audioCaptureRef.current = null
    }

    // Stop native capture if active
    if (isNativeCaptureRef.current) {
      await ipc.audio.stopNativeCapture()
      isNativeCaptureRef.current = false
    }

    setRecording(false)
    setIsMicMuted(false)
    setSystemAudioSilent(false)
    setAudioLevel(0)
    setIsNativeCapture(false)
    isMicMutedRef.current = false
  }, [setRecording])

  const toggleMicMute = useCallback(() => {
    const newMuted = !isMicMutedRef.current
    isMicMutedRef.current = newMuted
    setIsMicMuted(newMuted)
    if (audioCaptureRef.current) {
      audioCaptureRef.current.setMicMuted(newMuted)
    }
  }, [])

  return { isRecording, entries, error, isMicMuted, systemAudioSilent, audioLevel, isNativeCapture, start, stop, toggleMicMute }
}
