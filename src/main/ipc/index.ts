import type { BrowserWindow } from 'electron'

import { AudioCaptureService, AudioMixer, NativeAudioCapture, OutputDeviceService, isNativeAudioSupported } from '../audio'
import { SessionStore, SettingsStore } from '../storage'
import {
  OpenAIRealtimeClient,
  SummaryGenerator,
  OpenAICurationProvider,
  WhisperBatchClient,
} from '../transcription'
import { registerAudioHandlers } from './audioHandlers'
import { registerCurationHandlers } from './curationHandlers'
import { registerNativeAudioHandlers } from './nativeAudioHandlers'
import { registerOutputDeviceHandlers } from './outputDeviceHandlers'
import { registerSessionHandlers } from './sessionHandlers'
import { registerSettingsHandlers } from './settingsHandlers'
import { registerTranscriptionHandlers } from './transcriptionHandlers'

import type { SummaryProviderType, CurationProviderType } from '../storage'
import type { SummaryProvider, CurationProvider } from '../transcription'

export function registerAllHandlers(getWindow: () => BrowserWindow | null): void {
  const audioService = new AudioCaptureService()
  const realtimeClient = new OpenAIRealtimeClient()
  const whisperClient = new WhisperBatchClient()
  const sessionStore = new SessionStore()
  const settingsStore = new SettingsStore()
  const outputDeviceService = new OutputDeviceService()

  const summaryProviders: Record<SummaryProviderType, SummaryProvider> = {
    openai: new SummaryGenerator()
  }

  const curationProviders: Record<CurationProviderType, CurationProvider> = {
    openai: new OpenAICurationProvider()
  }

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
    summaryProviders,
    settingsStore,
    getWindow,
    nativeSupported ? audioMixer : undefined
  )
  registerSessionHandlers(sessionStore)
  registerSettingsHandlers(settingsStore)
  registerCurationHandlers(curationProviders, settingsStore)
  registerOutputDeviceHandlers(outputDeviceService)
}
