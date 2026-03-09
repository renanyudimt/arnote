import type { OutputDevice } from '@/types/audio'
import type { Session, TranscriptEntry, Summary } from '@/types/session'

import { IPC } from '../../../preload/constants'

export type TranscriptionMode = 'realtime' | 'whisper'
export type SummaryProviderType = 'openai'
export type CurationProviderType = 'openai'

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

export const ipc = {
  audio: {
    start: (): Promise<boolean> => window.electron.ipcRenderer.invoke(IPC.AUDIO_START),
    stop: (): Promise<boolean> => window.electron.ipcRenderer.invoke(IPC.AUDIO_STOP),
    checkPermissions: (): Promise<boolean> =>
      window.electron.ipcRenderer.invoke(IPC.AUDIO_PERMISSIONS),
    sendMicChunk: (buffer: ArrayBuffer): void => {
      window.api.audio.sendMicChunk(buffer)
    },
    startNativeCapture: (): Promise<boolean> => window.api.audio.startNativeCapture(),
    stopNativeCapture: (): Promise<boolean> => window.api.audio.stopNativeCapture(),
    isNativeSupported: (): Promise<boolean> => window.api.audio.isNativeSupported(),
    getOutputDevices: (): Promise<OutputDevice[]> => window.api.audio.getOutputDevices(),
    getDefaultOutputDevice: (): Promise<OutputDevice> => window.api.audio.getDefaultOutputDevice(),
    setOutputDevice: (id: number): Promise<void> => window.api.audio.setOutputDevice(id),
    onNativeSilence: (callback: (isSilent: boolean) => void): (() => void) => {
      const handler = (_event: unknown, isSilent: boolean): void => {
        callback(isSilent)
      }
      window.electron.ipcRenderer.on(IPC.NATIVE_AUDIO_SILENCE, handler)
      return () => {
        window.electron.ipcRenderer.removeAllListeners(IPC.NATIVE_AUDIO_SILENCE)
      }
    },
    onNativeLevel: (callback: (level: number) => void): (() => void) => {
      const handler = (_event: unknown, level: number): void => {
        callback(level)
      }
      window.electron.ipcRenderer.on(IPC.NATIVE_AUDIO_LEVEL, handler)
      return () => {
        window.electron.ipcRenderer.removeAllListeners(IPC.NATIVE_AUDIO_LEVEL)
      }
    },
    onNativeError: (callback: (error: string) => void): (() => void) => {
      const handler = (_event: unknown, error: string): void => {
        callback(error)
      }
      window.electron.ipcRenderer.on(IPC.NATIVE_AUDIO_ERROR, handler)
      return () => {
        window.electron.ipcRenderer.removeAllListeners(IPC.NATIVE_AUDIO_ERROR)
      }
    }
  },

  transcription: {
    start: (mode: TranscriptionMode): Promise<boolean> =>
      window.electron.ipcRenderer.invoke(IPC.TRANSCRIPTION_START, mode),
    stop: (): Promise<boolean> => window.electron.ipcRenderer.invoke(IPC.TRANSCRIPTION_STOP),
    pause: (): Promise<boolean> => window.electron.ipcRenderer.invoke(IPC.TRANSCRIPTION_PAUSE),
    resume: (): Promise<boolean> => window.electron.ipcRenderer.invoke(IPC.TRANSCRIPTION_RESUME),
    onChunk: (callback: (entry: TranscriptEntry) => void): (() => void) => {
      window.electron.ipcRenderer.removeAllListeners(IPC.TRANSCRIPTION_CHUNK)

      const handler = (_event: unknown, entry: TranscriptEntry): void => {
        callback(entry)
      }
      window.electron.ipcRenderer.on(IPC.TRANSCRIPTION_CHUNK, handler)
      return () => {
        window.electron.ipcRenderer.removeAllListeners(IPC.TRANSCRIPTION_CHUNK)
      }
    },
    onError: (callback: (error: string) => void): (() => void) => {
      window.electron.ipcRenderer.removeAllListeners(IPC.TRANSCRIPTION_ERROR)

      const handler = (_event: unknown, error: string): void => {
        callback(error)
      }
      window.electron.ipcRenderer.on(IPC.TRANSCRIPTION_ERROR, handler)
      return () => {
        window.electron.ipcRenderer.removeAllListeners(IPC.TRANSCRIPTION_ERROR)
      }
    }
  },

  summary: {
    generate: (transcript: TranscriptEntry[], language?: string): Promise<Summary> =>
      window.electron.ipcRenderer.invoke(IPC.SUMMARY_GENERATE, transcript, language)
  },

  curation: {
    curate: (
      transcript: TranscriptEntry[],
      language?: string,
      glossary?: string[]
    ): Promise<TranscriptEntry[]> =>
      window.electron.ipcRenderer.invoke(
        IPC.CURATION_CURATE,
        transcript,
        language,
        glossary
      ) as Promise<TranscriptEntry[]>
  },

  session: {
    list: (): Promise<Session[]> => window.electron.ipcRenderer.invoke(IPC.SESSION_LIST),
    get: (id: string): Promise<Session> => window.electron.ipcRenderer.invoke(IPC.SESSION_GET, id),
    save: (session: Session): Promise<Session> =>
      window.electron.ipcRenderer.invoke(IPC.SESSION_SAVE, session),
    delete: (id: string): Promise<boolean> =>
      window.electron.ipcRenderer.invoke(IPC.SESSION_DELETE, id),
    exportMd: (id: string): Promise<string | null> =>
      window.electron.ipcRenderer.invoke(IPC.SESSION_EXPORT_MD, id)
  },

  settings: {
    get: (): Promise<Settings> =>
      window.electron.ipcRenderer.invoke(IPC.SETTINGS_GET) as Promise<Settings>,
    setApiKey: (key: string): Promise<void> =>
      window.electron.ipcRenderer.invoke(IPC.SETTINGS_SET_API_KEY, key) as Promise<void>,
    setMode: (mode: TranscriptionMode): Promise<void> =>
      window.electron.ipcRenderer.invoke(IPC.SETTINGS_SET_MODE, mode) as Promise<void>,
    setMicDevice: (deviceId: string): Promise<void> =>
      window.electron.ipcRenderer.invoke(IPC.SETTINGS_SET_MIC_DEVICE, deviceId) as Promise<void>,
    setSystemAudioSource: (source: string): Promise<void> =>
      window.electron.ipcRenderer.invoke(
        IPC.SETTINGS_SET_SYSTEM_AUDIO_SOURCE,
        source
      ) as Promise<void>,
    validateApiKey: (key: string): Promise<ValidationResult> =>
      window.electron.ipcRenderer.invoke(
        IPC.SETTINGS_VALIDATE_API_KEY,
        key
      ) as Promise<ValidationResult>,
    setWhisperModel: (model: string): Promise<void> =>
      window.electron.ipcRenderer.invoke(IPC.SETTINGS_SET_WHISPER_MODEL, model) as Promise<void>,
    setSummaryModel: (model: string): Promise<void> =>
      window.electron.ipcRenderer.invoke(IPC.SETTINGS_SET_SUMMARY_MODEL, model) as Promise<void>,
    setSummaryProvider: (provider: SummaryProviderType): Promise<void> =>
      window.electron.ipcRenderer.invoke(
        IPC.SETTINGS_SET_SUMMARY_PROVIDER,
        provider
      ) as Promise<void>,
    setCurationEnabled: (enabled: boolean): Promise<void> =>
      window.electron.ipcRenderer.invoke(
        IPC.SETTINGS_SET_CURATION_ENABLED,
        enabled
      ) as Promise<void>,
    setCurationProvider: (provider: CurationProviderType): Promise<void> =>
      window.electron.ipcRenderer.invoke(
        IPC.SETTINGS_SET_CURATION_PROVIDER,
        provider
      ) as Promise<void>,
    setCurationModel: (model: string): Promise<void> =>
      window.electron.ipcRenderer.invoke(
        IPC.SETTINGS_SET_CURATION_MODEL,
        model
      ) as Promise<void>,
    setCurationGlossary: (glossary: string[]): Promise<void> =>
      window.electron.ipcRenderer.invoke(
        IPC.SETTINGS_SET_CURATION_GLOSSARY,
        glossary
      ) as Promise<void>,
    getApiKeyStatus: (): Promise<ApiKeyStatus> =>
      window.electron.ipcRenderer.invoke(
        IPC.SETTINGS_GET_API_KEY_STATUS
      ) as Promise<ApiKeyStatus>
  }
}
