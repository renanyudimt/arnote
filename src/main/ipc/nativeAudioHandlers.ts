import type { BrowserWindow } from 'electron'
import { ipcMain } from 'electron'

import { IPC } from './constants'
import { isNativeAudioSupported } from '../audio/platformUtils'

import type { AudioMixer } from '../audio/AudioMixer'
import type { NativeAudioCapture } from '../audio/NativeAudioCapture'

export function registerNativeAudioHandlers(
  nativeCapture: NativeAudioCapture,
  audioMixer: AudioMixer,
  getWindow: () => BrowserWindow | null
): void {
  ipcMain.handle(IPC.NATIVE_AUDIO_SUPPORTED, () => isNativeAudioSupported())

  ipcMain.handle(IPC.NATIVE_AUDIO_START, async () => {
    await nativeCapture.start()
    return true
  })

  ipcMain.handle(IPC.NATIVE_AUDIO_STOP, async () => {
    await nativeCapture.stop()
    audioMixer.stop()
    return true
  })

  ipcMain.on(IPC.AUDIO_MIC_CHUNK, (_event, data: Buffer | Uint8Array) => {
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data)
    audioMixer.appendMicChunk(buffer)
  })

  nativeCapture.on('silence', (isSilent) => {
    const window = getWindow()
    if (window && !window.isDestroyed()) {
      window.webContents.send(IPC.NATIVE_AUDIO_SILENCE, isSilent)
    }
  })

  nativeCapture.on('level', (level) => {
    const window = getWindow()
    if (window && !window.isDestroyed()) {
      window.webContents.send(IPC.NATIVE_AUDIO_LEVEL, level)
    }
  })

  nativeCapture.on('error', (error) => {
    const window = getWindow()
    if (window && !window.isDestroyed()) {
      window.webContents.send(IPC.NATIVE_AUDIO_ERROR, error.message)
    }
  })
}
