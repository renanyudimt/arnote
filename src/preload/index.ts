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
    isNativeSupported: (): Promise<boolean> => ipcRenderer.invoke(IPC.NATIVE_AUDIO_SUPPORTED)
  },
  transcription: {
    start: (mode: TranscriptionMode): Promise<boolean> =>
      ipcRenderer.invoke(IPC.TRANSCRIPTION_START, mode),
    stop: (): Promise<boolean> => ipcRenderer.invoke(IPC.TRANSCRIPTION_STOP)
  },
  summary: {
    generate: (transcript: unknown[]): Promise<unknown> =>
      ipcRenderer.invoke(IPC.SUMMARY_GENERATE, transcript)
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
      ipcRenderer.invoke(IPC.SETTINGS_VALIDATE_API_KEY, key)
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
