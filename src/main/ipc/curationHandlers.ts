import { ipcMain } from 'electron'

import { IPC } from './constants'
import { wrapHandler } from './utils'
import { createLogger } from '../lib/logger'

import type { SettingsStore, CurationProviderType } from '../storage'
import type { CurationProvider, TranscriptEntry } from '../transcription'

const logger = createLogger('CurationHandlers')

export function registerCurationHandlers(
  curationProviders: Record<CurationProviderType, CurationProvider>,
  settingsStore: SettingsStore
): void {
  ipcMain.handle(
    IPC.CURATION_CURATE,
    wrapHandler(async (transcript: TranscriptEntry[], language?: string, glossary?: string[]) => {
      const type = settingsStore.getCurationProvider()
      const provider = curationProviders[type]

      if (!provider) {
        throw new Error(`Unknown curation provider: "${type}". Available: ${Object.keys(curationProviders).join(', ')}`)
      }

      const apiKey = settingsStore.getApiKey()
      if (!apiKey) throw new Error('OpenAI API key not configured')
      provider.configure(apiKey, settingsStore.getCurationModel())

      const effectiveGlossary = glossary ?? settingsStore.getCurationGlossary()
      return await provider.curate(transcript, language, effectiveGlossary)
    })
  )

  ipcMain.handle(IPC.SETTINGS_SET_CURATION_ENABLED, wrapHandler((enabled: boolean) => {
    logger.info(`Curation enabled: ${enabled}`)
    settingsStore.setCurationEnabled(enabled)
  }))

  ipcMain.handle(IPC.SETTINGS_SET_CURATION_PROVIDER, wrapHandler((provider: CurationProviderType) => {
    logger.info(`Curation provider set to: ${provider}`)
    settingsStore.setCurationProvider(provider)
  }))

  ipcMain.handle(IPC.SETTINGS_SET_CURATION_MODEL, wrapHandler((model: string) => {
    logger.info(`Curation model set to: ${model}`)
    settingsStore.setCurationModel(model)
  }))

  ipcMain.handle(IPC.SETTINGS_SET_CURATION_GLOSSARY, wrapHandler((glossary: string[]) => {
    logger.info(`Curation glossary updated: ${glossary.length} terms`)
    settingsStore.setCurationGlossary(glossary)
  }))
}
