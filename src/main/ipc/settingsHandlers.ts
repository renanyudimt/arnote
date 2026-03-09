import { ipcMain, net } from 'electron'

import { IPC } from './constants'
import { wrapHandler } from './utils'
import { formatApiError } from '../lib/apiErrors'
import { createLogger } from '../lib/logger'

import type { SettingsStore, TranscriptionMode, SummaryProviderType } from '../storage'


const logger = createLogger('Settings')

export function registerSettingsHandlers(settingsStore: SettingsStore): void {
  ipcMain.handle(IPC.SETTINGS_GET, wrapHandler(() => settingsStore.getAllForRenderer()))

  ipcMain.handle(IPC.SETTINGS_SET_API_KEY, wrapHandler((key: string) => {
    logger.info('API key updated')
    settingsStore.setApiKey(key)
  }))

  ipcMain.handle(IPC.SETTINGS_SET_MODE, wrapHandler((mode: TranscriptionMode) => {
    logger.info(`Transcription mode set to: ${mode}`)
    settingsStore.setTranscriptionMode(mode)
  }))

  ipcMain.handle(IPC.SETTINGS_SET_MIC_DEVICE, wrapHandler((deviceId: string) => {
    logger.info(`Mic device set to: ${deviceId}`)
    settingsStore.setSelectedMicDeviceId(deviceId)
  }))

  ipcMain.handle(IPC.SETTINGS_SET_SYSTEM_AUDIO_SOURCE, wrapHandler((source: string) => {
    logger.info(`System audio source set to: ${source}`)
    settingsStore.setSystemAudioSource(source)
  }))

  ipcMain.handle(IPC.SETTINGS_SET_WHISPER_MODEL, wrapHandler((model: string) => {
    logger.info(`Whisper model set to: ${model}`)
    settingsStore.setWhisperModel(model)
  }))

  ipcMain.handle(IPC.SETTINGS_SET_SUMMARY_MODEL, wrapHandler((model: string) => {
    logger.info(`Summary model set to: ${model}`)
    settingsStore.setSummaryModel(model)
  }))

  ipcMain.handle(IPC.SETTINGS_SET_SUMMARY_PROVIDER, wrapHandler((provider: SummaryProviderType) => {
    logger.info(`Summary provider set to: ${provider}`)
    settingsStore.setSummaryProvider(provider)
  }))

  ipcMain.handle(IPC.SETTINGS_VALIDATE_API_KEY, wrapHandler(async (key: string) => {
    const request = net.request({
      method: 'GET',
      url: 'https://api.openai.com/v1/models',
      headers: {
        Authorization: `Bearer ${key}`
      }
    })

    return new Promise<{ valid: boolean; error?: string }>((resolve) => {
      request.on('response', (response) => {
        if (response.statusCode === 200) {
          logger.info('API key validation: valid')
          resolve({ valid: true })
        } else {
          let responseBody = ''
          response.on('data', (chunk: Buffer) => {
            responseBody += chunk.toString()
          })
          response.on('end', () => {
            const error = formatApiError(response.statusCode, responseBody)
            logger.warn('API key validation failed:', error)
            resolve({ valid: false, error })
          })
        }
      })

      request.on('error', (error) => {
        logger.error('API key validation error:', error.message)
        resolve({ valid: false, error: error.message })
      })

      request.end()
    })
  }))

  ipcMain.handle(IPC.SETTINGS_GET_API_KEY_STATUS, wrapHandler(() =>
    settingsStore.getApiKeyStatus()
  ))
}
