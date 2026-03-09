import Store from 'electron-store'

export type TranscriptionMode = 'realtime' | 'whisper'
export type SummaryProviderType = 'openai'
export type CurationProviderType = 'openai'

interface SettingsSchema {
  openaiApiKey: string
  transcriptionMode: TranscriptionMode
  selectedMicDeviceId: string
  systemAudioSource: string
  whisperModel: string
  summaryModel: string
  summaryProvider: SummaryProviderType
  curationEnabled: boolean
  curationProvider: CurationProviderType
  curationModel: string
  curationGlossary: string[]
}

export class SettingsStore {
  private store: Store<SettingsSchema>

  constructor() {
    this.store = new Store<SettingsSchema>({
      name: 'settings',
      defaults: {
        openaiApiKey: '',
        transcriptionMode: 'whisper',
        selectedMicDeviceId: '',
        systemAudioSource: 'loopback',
        whisperModel: 'whisper-1',
        summaryModel: 'gpt-4o',
        summaryProvider: 'openai',
        curationEnabled: false,
        curationProvider: 'openai',
        curationModel: 'gpt-4o-mini',
        curationGlossary: []
      }
    })
  }

  getApiKey(): string {
    return this.store.get('openaiApiKey')
  }

  setApiKey(key: string): void {
    this.store.set('openaiApiKey', key)
  }

  getTranscriptionMode(): TranscriptionMode {
    return this.store.get('transcriptionMode')
  }

  setTranscriptionMode(mode: TranscriptionMode): void {
    this.store.set('transcriptionMode', mode)
  }

  getSelectedMicDeviceId(): string {
    return this.store.get('selectedMicDeviceId')
  }

  setSelectedMicDeviceId(deviceId: string): void {
    this.store.set('selectedMicDeviceId', deviceId)
  }

  getSystemAudioSource(): string {
    return this.store.get('systemAudioSource')
  }

  setSystemAudioSource(source: string): void {
    this.store.set('systemAudioSource', source)
  }

  getWhisperModel(): string {
    return this.store.get('whisperModel')
  }

  setWhisperModel(model: string): void {
    this.store.set('whisperModel', model)
  }

  getSummaryModel(): string {
    return this.store.get('summaryModel')
  }

  setSummaryModel(model: string): void {
    this.store.set('summaryModel', model)
  }

  getSummaryProvider(): SummaryProviderType {
    const value = this.store.get('summaryProvider')
    return value === 'openai' ? value : 'openai'
  }

  setSummaryProvider(provider: SummaryProviderType): void {
    this.store.set('summaryProvider', provider)
  }

  getCurationEnabled(): boolean {
    return this.store.get('curationEnabled')
  }

  setCurationEnabled(enabled: boolean): void {
    this.store.set('curationEnabled', enabled)
  }

  getCurationProvider(): CurationProviderType {
    const value = this.store.get('curationProvider')
    return value === 'openai' ? value : 'openai'
  }

  setCurationProvider(provider: CurationProviderType): void {
    this.store.set('curationProvider', provider)
  }

  getCurationModel(): string {
    return this.store.get('curationModel')
  }

  setCurationModel(model: string): void {
    this.store.set('curationModel', model)
  }

  getCurationGlossary(): string[] {
    return this.store.get('curationGlossary')
  }

  setCurationGlossary(glossary: string[]): void {
    this.store.set('curationGlossary', glossary)
  }

  getAll(): SettingsSchema {
    return {
      openaiApiKey: this.store.get('openaiApiKey'),
      transcriptionMode: this.store.get('transcriptionMode'),
      selectedMicDeviceId: this.store.get('selectedMicDeviceId'),
      systemAudioSource: this.store.get('systemAudioSource'),
      whisperModel: this.store.get('whisperModel'),
      summaryModel: this.store.get('summaryModel'),
      summaryProvider: this.store.get('summaryProvider'),
      curationEnabled: this.store.get('curationEnabled'),
      curationProvider: this.store.get('curationProvider'),
      curationModel: this.store.get('curationModel'),
      curationGlossary: this.store.get('curationGlossary')
    }
  }

  getAllForRenderer(): Omit<SettingsSchema, 'openaiApiKey'> & { hasApiKey: boolean } {
    return {
      hasApiKey: this.hasApiKey(),
      transcriptionMode: this.store.get('transcriptionMode'),
      selectedMicDeviceId: this.store.get('selectedMicDeviceId'),
      systemAudioSource: this.store.get('systemAudioSource'),
      whisperModel: this.store.get('whisperModel'),
      summaryModel: this.store.get('summaryModel'),
      summaryProvider: this.store.get('summaryProvider'),
      curationEnabled: this.store.get('curationEnabled'),
      curationProvider: this.store.get('curationProvider'),
      curationModel: this.store.get('curationModel'),
      curationGlossary: this.store.get('curationGlossary')
    }
  }

  getApiKeyStatus(): { hasKey: boolean; maskedKey: string } {
    const key = this.store.get('openaiApiKey')
    if (!key) return { hasKey: false, maskedKey: '' }
    const masked = key.length > 8
      ? `${key.slice(0, 4)}...${key.slice(-4)}`
      : '****'
    return { hasKey: true, maskedKey: masked }
  }

  hasApiKey(): boolean {
    return this.store.get('openaiApiKey').length > 0
  }
}
