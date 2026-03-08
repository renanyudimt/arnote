import Store from 'electron-store'

export type TranscriptionMode = 'realtime' | 'whisper'

interface SettingsSchema {
  openaiApiKey: string
  transcriptionMode: TranscriptionMode
  selectedMicDeviceId: string
  systemAudioSource: string
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
        systemAudioSource: 'loopback'
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

  getAll(): SettingsSchema {
    return {
      openaiApiKey: this.store.get('openaiApiKey'),
      transcriptionMode: this.store.get('transcriptionMode'),
      selectedMicDeviceId: this.store.get('selectedMicDeviceId'),
      systemAudioSource: this.store.get('systemAudioSource')
    }
  }

  hasApiKey(): boolean {
    return this.store.get('openaiApiKey').length > 0
  }
}
