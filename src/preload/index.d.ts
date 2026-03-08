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

interface Settings {
  openaiApiKey: string
  transcriptionMode: TranscriptionMode
  selectedMicDeviceId: string
  systemAudioSource: string
}

interface ValidationResult {
  valid: boolean
  error?: string
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
  }
  transcription: {
    start: (mode: TranscriptionMode) => Promise<boolean>
    stop: () => Promise<boolean>
  }
  summary: {
    generate: (transcript: TranscriptEntry[]) => Promise<Summary>
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
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: ArnoteAPI
  }
}
