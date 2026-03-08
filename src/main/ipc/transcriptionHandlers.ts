import type { BrowserWindow } from 'electron'
import { ipcMain } from 'electron'

import { IPC } from './constants'

import type { AudioMixer } from '../audio/AudioMixer'
import type { SettingsStore, TranscriptionMode } from '../storage'
import type {
  OpenAIRealtimeClient,
  WhisperBatchClient,
  SummaryGenerator,
  TranscriptEntry,
} from '../transcription'


export function registerTranscriptionHandlers(
  realtimeClient: OpenAIRealtimeClient,
  whisperClient: WhisperBatchClient,
  summaryGenerator: SummaryGenerator,
  settingsStore: SettingsStore,
  getWindow: () => BrowserWindow | null,
  audioMixer?: AudioMixer
): void {
  let activeMode: TranscriptionMode | null = null

  ipcMain.handle(IPC.TRANSCRIPTION_START, async (_event, mode: TranscriptionMode) => {
    const apiKey = settingsStore.getApiKey()
    if (!apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const window = getWindow()
    activeMode = mode

    if (mode === 'realtime') {
      realtimeClient.setApiKey(apiKey)
      if (window) realtimeClient.setWindow(window)
      await realtimeClient.connect()
    } else {
      whisperClient.setApiKey(apiKey)
      if (window) whisperClient.setWindow(window)
      whisperClient.start()
    }

    // Wire mixer to route mixed audio to the active transcription client
    if (audioMixer) {
      audioMixer.setOnMixedChunk((buffer) => {
        if (activeMode === 'realtime') {
          realtimeClient.sendAudioChunk(buffer)
        } else if (activeMode === 'whisper') {
          whisperClient.appendChunk(buffer)
        }
      })
      audioMixer.start()
    }

    return true
  })

  ipcMain.handle(IPC.TRANSCRIPTION_STOP, () => {
    if (audioMixer) {
      audioMixer.stop()
    }

    if (activeMode === 'realtime') {
      realtimeClient.disconnect()
    } else if (activeMode === 'whisper') {
      whisperClient.stop()
    }

    activeMode = null
    return true
  })

  ipcMain.handle(IPC.SUMMARY_GENERATE, async (_event, transcript: TranscriptEntry[]) => {
    const apiKey = settingsStore.getApiKey()
    if (!apiKey) {
      throw new Error('OpenAI API key not configured')
    }
    summaryGenerator.setApiKey(apiKey)
    return await summaryGenerator.generate(transcript)
  })
}
