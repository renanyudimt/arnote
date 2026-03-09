import { contextBridge, ipcRenderer } from 'electron'

import { electronAPI } from '@electron-toolkit/preload'

import { IPC } from './constants'

import type { TranscriptionMode } from './constants'

const api = {
  audio: {
    start: (): Promise<boolean> => ipcRenderer.invoke(IPC.AUDIO_START),
    stop: (): Promise<boolean> => ipcRenderer.invoke(IPC.AUDIO_STOP),
    checkPermissions: (): Promise<boolean> => ipcRenderer.invoke(IPC.AUDIO_PERMISSIONS),
    enableLoopbackAudio: (): Promise<void> => ipcRenderer.invoke(IPC.LOOPBACK_ENABLE),
    disableLoopbackAudio: (): Promise<void> => ipcRenderer.invoke(IPC.LOOPBACK_DISABLE),
    sendMicChunk: (buffer: ArrayBuffer): void => {
      ipcRenderer.send(IPC.AUDIO_MIC_CHUNK, Buffer.from(buffer))
    },
    startNativeCapture: (): Promise<boolean> => ipcRenderer.invoke(IPC.NATIVE_AUDIO_START),
    stopNativeCapture: (): Promise<boolean> => ipcRenderer.invoke(IPC.NATIVE_AUDIO_STOP),
    isNativeSupported: (): Promise<boolean> => ipcRenderer.invoke(IPC.NATIVE_AUDIO_SUPPORTED),
    getOutputDevices: (): Promise<unknown[]> => ipcRenderer.invoke(IPC.AUDIO_OUTPUT_DEVICES),
    getDefaultOutputDevice: (): Promise<unknown> => ipcRenderer.invoke(IPC.AUDIO_DEFAULT_OUTPUT),
    setOutputDevice: (id: number): Promise<void> => ipcRenderer.invoke(IPC.AUDIO_SET_OUTPUT, id)
  },
  transcription: {
    start: (mode: TranscriptionMode): Promise<boolean> =>
      ipcRenderer.invoke(IPC.TRANSCRIPTION_START, mode),
    stop: (): Promise<boolean> => ipcRenderer.invoke(IPC.TRANSCRIPTION_STOP),
    pause: (): Promise<boolean> => ipcRenderer.invoke(IPC.TRANSCRIPTION_PAUSE),
    resume: (): Promise<boolean> => ipcRenderer.invoke(IPC.TRANSCRIPTION_RESUME)
  },
  summary: {
    generate: (transcript: unknown[], language?: string): Promise<unknown> =>
      ipcRenderer.invoke(IPC.SUMMARY_GENERATE, transcript, language)
  },
  curation: {
    curate: (transcript: unknown[], language?: string, glossary?: string[]): Promise<unknown[]> =>
      ipcRenderer.invoke(IPC.CURATION_CURATE, transcript, language, glossary)
  },
  session: {
    list: (): Promise<unknown[]> => ipcRenderer.invoke(IPC.SESSION_LIST),
    get: (id: string): Promise<unknown> => ipcRenderer.invoke(IPC.SESSION_GET, id),
    save: (session: unknown): Promise<unknown> => ipcRenderer.invoke(IPC.SESSION_SAVE, session),
    delete: (id: string): Promise<boolean> => ipcRenderer.invoke(IPC.SESSION_DELETE, id),
    exportMd: (id: string): Promise<string | null> => ipcRenderer.invoke(IPC.SESSION_EXPORT_MD, id)
  },
  settings: {
    get: (): Promise<unknown> => ipcRenderer.invoke(IPC.SETTINGS_GET),
    setApiKey: (key: string): Promise<void> => ipcRenderer.invoke(IPC.SETTINGS_SET_API_KEY, key),
    setMode: (mode: TranscriptionMode): Promise<void> =>
      ipcRenderer.invoke(IPC.SETTINGS_SET_MODE, mode),
    setMicDevice: (deviceId: string): Promise<void> =>
      ipcRenderer.invoke(IPC.SETTINGS_SET_MIC_DEVICE, deviceId),
    setSystemAudioSource: (source: string): Promise<void> =>
      ipcRenderer.invoke(IPC.SETTINGS_SET_SYSTEM_AUDIO_SOURCE, source),
    validateApiKey: (key: string): Promise<unknown> =>
      ipcRenderer.invoke(IPC.SETTINGS_VALIDATE_API_KEY, key),
    setWhisperModel: (model: string): Promise<void> =>
      ipcRenderer.invoke(IPC.SETTINGS_SET_WHISPER_MODEL, model),
    setSummaryModel: (model: string): Promise<void> =>
      ipcRenderer.invoke(IPC.SETTINGS_SET_SUMMARY_MODEL, model),
    setSummaryProvider: (provider: string): Promise<void> =>
      ipcRenderer.invoke(IPC.SETTINGS_SET_SUMMARY_PROVIDER, provider),
    setCurationEnabled: (enabled: boolean): Promise<void> =>
      ipcRenderer.invoke(IPC.SETTINGS_SET_CURATION_ENABLED, enabled),
    setCurationProvider: (provider: string): Promise<void> =>
      ipcRenderer.invoke(IPC.SETTINGS_SET_CURATION_PROVIDER, provider),
    setCurationModel: (model: string): Promise<void> =>
      ipcRenderer.invoke(IPC.SETTINGS_SET_CURATION_MODEL, model),
    setCurationGlossary: (glossary: string[]): Promise<void> =>
      ipcRenderer.invoke(IPC.SETTINGS_SET_CURATION_GLOSSARY, glossary),
    getApiKeyStatus: (): Promise<unknown> =>
      ipcRenderer.invoke(IPC.SETTINGS_GET_API_KEY_STATUS)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  const win = window as unknown as { electron: typeof electronAPI; api: typeof api }
  win.electron = electronAPI
  win.api = api
}
