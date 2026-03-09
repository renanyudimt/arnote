import type { BrowserWindow } from 'electron'
import { ipcMain } from 'electron'

import { IPC } from './constants'
import { wrapHandler } from './utils'
import { createLogger } from '../lib/logger'

import type { AudioMixer } from '../audio/AudioMixer'
import type { SettingsStore, TranscriptionMode, SummaryProviderType } from '../storage'
import type {
  OpenAIRealtimeClient,
  WhisperBatchClient,
  SummaryProvider,
  TranscriptEntry,
} from '../transcription'


export function registerTranscriptionHandlers(
  realtimeClient: OpenAIRealtimeClient,
  whisperClient: WhisperBatchClient,
  summaryProviders: Record<SummaryProviderType, SummaryProvider>,
  settingsStore: SettingsStore,
  getWindow: () => BrowserWindow | null,
  audioMixer?: AudioMixer
): void {
  const logger = createLogger('Transcription')
  let activeMode: TranscriptionMode | null = null

  ipcMain.handle(IPC.TRANSCRIPTION_START, wrapHandler(async (mode: TranscriptionMode) => {
    const window = getWindow()
    activeMode = mode

    if (mode === 'realtime') {
      const apiKey = settingsStore.getApiKey()
      if (!apiKey) throw new Error('OpenAI API key not configured')
      realtimeClient.setApiKey(apiKey)
      if (window) realtimeClient.setWindow(window)
      await realtimeClient.connect()
    } else {
      const apiKey = settingsStore.getApiKey()
      if (!apiKey) throw new Error('OpenAI API key not configured')
      whisperClient.setApiKey(apiKey)
      whisperClient.setBaseUrl('https://api.openai.com')
      whisperClient.setModelName(settingsStore.getWhisperModel())
      if (window) whisperClient.setWindow(window)
      whisperClient.start()
    }

    // Wire mixer to route mixed audio to the active transcription client
    if (audioMixer) {
      let loggedFirstRoute = false
      audioMixer.setOnMixedChunk((buffer) => {
        if (!loggedFirstRoute) {
          loggedFirstRoute = true
          logger.info(`First mixed chunk routed (activeMode: ${activeMode})`)
        }
        if (activeMode === 'realtime') {
          realtimeClient.sendAudioChunk(buffer)
        } else if (activeMode === 'whisper') {
          whisperClient.appendChunk(buffer)
        }
      })
      audioMixer.start()
    }

    return true
  }))

  ipcMain.handle(IPC.TRANSCRIPTION_STOP, wrapHandler(() => {
    if (audioMixer) {
      audioMixer.stop()
    }

    // Always stop both clients to prevent stale isRunning state
    realtimeClient.disconnect()
    whisperClient.stop()

    activeMode = null
    return true
  }))

  ipcMain.handle(IPC.TRANSCRIPTION_PAUSE, wrapHandler(() => {
    if (audioMixer) {
      audioMixer.pause()
    }
    return true
  }))

  ipcMain.handle(IPC.TRANSCRIPTION_RESUME, wrapHandler(() => {
    if (audioMixer) {
      audioMixer.resume()
    }
    return true
  }))

  ipcMain.handle(
    IPC.SUMMARY_GENERATE,
    wrapHandler(async (transcript: TranscriptEntry[], language?: string) => {
      const type = settingsStore.getSummaryProvider()
      const provider = summaryProviders[type]

      if (!provider) {
        throw new Error(`Unknown summary provider: "${type}". Available: ${Object.keys(summaryProviders).join(', ')}`)
      }

      const apiKey = settingsStore.getApiKey()
      if (!apiKey) throw new Error('OpenAI API key not configured')
      provider.configure(apiKey, settingsStore.getSummaryModel())

      return await provider.generate(transcript, language)
    })
  )
}
