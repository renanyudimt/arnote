import { ElectronAPI } from '@electron-toolkit/preload'

import type { TranscriptionMode } from './constants'

interface DebugLogEntry {
  level: 'debug' | 'info' | 'warn' | 'error'
  namespace: string
  message: string
  timestamp: number
}

interface TranscriptEntry {
  id: string
  timestamp: number
  text: string
  speaker?: string
}

interface Summary {
  title: string
  keyPoints: string[]
  actionItems: string[]
  fullSummary: string
}

interface Session {
  id: string
  createdAt: string
  endedAt: string | null
  title: string
  transcript: TranscriptEntry[]
  summary: Summary | null
  status: 'recording' | 'summarizing' | 'completed'
  filePath: string | null
}

type SummaryProviderType = 'openai'
type CurationProviderType = 'openai'

interface ApiKeyStatus {
  hasKey: boolean
  maskedKey: string
}

interface Settings {
  hasApiKey: boolean
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

interface ValidationResult {
  valid: boolean
  error?: string
}

interface OutputDevice {
  id: number
  uid: string
  name: string
}

interface ArnoteAPI {
  audio: {
    start: () => Promise<boolean>
    stop: () => Promise<boolean>
    checkPermissions: () => Promise<boolean>
    enableLoopbackAudio: () => Promise<void>
    disableLoopbackAudio: () => Promise<void>
    sendMicChunk: (buffer: ArrayBuffer) => void
    startNativeCapture: () => Promise<boolean>
    stopNativeCapture: () => Promise<boolean>
    isNativeSupported: () => Promise<boolean>
    getOutputDevices: () => Promise<OutputDevice[]>
    getDefaultOutputDevice: () => Promise<OutputDevice>
    setOutputDevice: (id: number) => Promise<void>
  }
  transcription: {
    start: (mode: TranscriptionMode) => Promise<boolean>
    stop: () => Promise<boolean>
    pause: () => Promise<boolean>
    resume: () => Promise<boolean>
  }
  summary: {
    generate: (transcript: TranscriptEntry[], language?: string) => Promise<Summary>
  }
  curation: {
    curate: (transcript: TranscriptEntry[], language?: string, glossary?: string[]) => Promise<TranscriptEntry[]>
  }
  session: {
    list: () => Promise<Session[]>
    get: (id: string) => Promise<Session>
    save: (session: Session) => Promise<Session>
    delete: (id: string) => Promise<boolean>
    exportMd: (id: string) => Promise<string | null>
  }
  settings: {
    get: () => Promise<Settings>
    setApiKey: (key: string) => Promise<void>
    setMode: (mode: TranscriptionMode) => Promise<void>
    setMicDevice: (deviceId: string) => Promise<void>
    setSystemAudioSource: (source: string) => Promise<void>
    validateApiKey: (key: string) => Promise<ValidationResult>
    setWhisperModel: (model: string) => Promise<void>
    setSummaryModel: (model: string) => Promise<void>
    setSummaryProvider: (provider: SummaryProviderType) => Promise<void>
    setCurationEnabled: (enabled: boolean) => Promise<void>
    setCurationProvider: (provider: CurationProviderType) => Promise<void>
    setCurationModel: (model: string) => Promise<void>
    setCurationGlossary: (glossary: string[]) => Promise<void>
    getApiKeyStatus: () => Promise<ApiKeyStatus>
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: ArnoteAPI
  }
}
