import type { BrowserWindow } from 'electron'

import { AudioCaptureService, AudioMixer, NativeAudioCapture, OutputDeviceService, isNativeAudioSupported } from '../audio'
import { SessionStore, SettingsStore } from '../storage'
import { OpenAIRealtimeClient, SummaryGenerator, WhisperBatchClient } from '../transcription'
import { registerAudioHandlers } from './audioHandlers'
import { registerNativeAudioHandlers } from './nativeAudioHandlers'
import { registerOutputDeviceHandlers } from './outputDeviceHandlers'
import { registerSessionHandlers } from './sessionHandlers'
import { registerSettingsHandlers } from './settingsHandlers'
import { registerTranscriptionHandlers } from './transcriptionHandlers'

export function registerAllHandlers(getWindow: () => BrowserWindow | null): void {
  const audioService = new AudioCaptureService()
  const realtimeClient = new OpenAIRealtimeClient()
  const whisperClient = new WhisperBatchClient()
  const summaryGenerator = new SummaryGenerator()
  const sessionStore = new SessionStore()
  const settingsStore = new SettingsStore()
  const outputDeviceService = new OutputDeviceService()

  const nativeSupported = isNativeAudioSupported()
  const nativeCapture = new NativeAudioCapture()
  const audioMixer = new AudioMixer()

  // Wire native audio capture chunks into the mixer
  nativeCapture.on('chunk', (buffer) => {
    audioMixer.appendSystemChunk(buffer)
  })

  registerAudioHandlers(audioService)
  registerNativeAudioHandlers(nativeCapture, audioMixer, getWindow)
  registerTranscriptionHandlers(
    realtimeClient,
    whisperClient,
    summaryGenerator,
    settingsStore,
    getWindow,
    nativeSupported ? audioMixer : undefined
  )
  registerSessionHandlers(sessionStore)
  registerSettingsHandlers(settingsStore)
  registerOutputDeviceHandlers(outputDeviceService)
}
