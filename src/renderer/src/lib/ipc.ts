import type { OutputDevice } from '@/types/audio'
import type { Session, TranscriptEntry, Summary } from '@/types/session'

export type TranscriptionMode = 'realtime' | 'whisper'

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

export const ipc = {
  audio: {
    start: (): Promise<boolean> => window.electron.ipcRenderer.invoke('audio:start'),
    stop: (): Promise<boolean> => window.electron.ipcRenderer.invoke('audio:stop'),
    checkPermissions: (): Promise<boolean> =>
      window.electron.ipcRenderer.invoke('audio:permissions'),
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
      const channel = 'native-audio:silence'
      const handler = (_event: unknown, isSilent: boolean): void => {
        callback(isSilent)
      }
      window.electron.ipcRenderer.on(channel, handler)
      return () => {
        window.electron.ipcRenderer.removeAllListeners(channel)
      }
    },
    onNativeLevel: (callback: (level: number) => void): (() => void) => {
      const channel = 'native-audio:level'
      const handler = (_event: unknown, level: number): void => {
        callback(level)
      }
      window.electron.ipcRenderer.on(channel, handler)
      return () => {
        window.electron.ipcRenderer.removeAllListeners(channel)
      }
    },
    onNativeError: (callback: (error: string) => void): (() => void) => {
      const channel = 'native-audio:error'
      const handler = (_event: unknown, error: string): void => {
        callback(error)
      }
      window.electron.ipcRenderer.on(channel, handler)
      return () => {
        window.electron.ipcRenderer.removeAllListeners(channel)
      }
    }
  },

  transcription: {
    start: (mode: TranscriptionMode): Promise<boolean> =>
      window.electron.ipcRenderer.invoke('transcription:start', mode),
    stop: (): Promise<boolean> => window.electron.ipcRenderer.invoke('transcription:stop'),
    onChunk: (callback: (entry: TranscriptEntry) => void): (() => void) => {
      const channel = 'transcription:chunk'
      window.electron.ipcRenderer.removeAllListeners(channel)

      const handler = (_event: unknown, entry: TranscriptEntry): void => {
        callback(entry)
      }
      window.electron.ipcRenderer.on(channel, handler)
      return () => {
        window.electron.ipcRenderer.removeAllListeners(channel)
      }
    },
    onError: (callback: (error: string) => void): (() => void) => {
      const channel = 'transcription:error'
      window.electron.ipcRenderer.removeAllListeners(channel)

      const handler = (_event: unknown, error: string): void => {
        callback(error)
      }
      window.electron.ipcRenderer.on(channel, handler)
      return () => {
        window.electron.ipcRenderer.removeAllListeners(channel)
      }
    }
  },

  summary: {
    generate: (transcript: TranscriptEntry[]): Promise<Summary> =>
      window.electron.ipcRenderer.invoke('summary:generate', transcript)
  },

  session: {
    list: (): Promise<Session[]> => window.electron.ipcRenderer.invoke('session:list'),
    get: (id: string): Promise<Session> => window.electron.ipcRenderer.invoke('session:get', id),
    save: (session: Session): Promise<Session> =>
      window.electron.ipcRenderer.invoke('session:save', session),
    delete: (id: string): Promise<boolean> =>
      window.electron.ipcRenderer.invoke('session:delete', id),
    exportMd: (id: string): Promise<string | null> =>
      window.electron.ipcRenderer.invoke('session:export-md', id)
  },

  settings: {
    get: (): Promise<Settings> =>
      window.electron.ipcRenderer.invoke('settings:get') as Promise<Settings>,
    setApiKey: (key: string): Promise<void> =>
      window.electron.ipcRenderer.invoke('settings:set-api-key', key) as Promise<void>,
    setMode: (mode: TranscriptionMode): Promise<void> =>
      window.electron.ipcRenderer.invoke('settings:set-mode', mode) as Promise<void>,
    setMicDevice: (deviceId: string): Promise<void> =>
      window.electron.ipcRenderer.invoke('settings:set-mic-device', deviceId) as Promise<void>,
    setSystemAudioSource: (source: string): Promise<void> =>
      window.electron.ipcRenderer.invoke(
        'settings:set-system-audio-source',
        source
      ) as Promise<void>,
    validateApiKey: (key: string): Promise<ValidationResult> =>
      window.electron.ipcRenderer.invoke(
        'settings:validate-api-key',
        key
      ) as Promise<ValidationResult>
  }
}
