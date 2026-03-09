import { ipcMain, systemPreferences } from 'electron'

import { IPC } from './constants'
import { wrapHandler } from './utils'

import type { AudioCaptureService } from '../audio'


export function registerAudioHandlers(audioService: AudioCaptureService): void {
  ipcMain.handle(IPC.AUDIO_START, wrapHandler(() => {
    audioService.start()
    return true
  }))

  ipcMain.handle(IPC.AUDIO_STOP, wrapHandler(() => {
    audioService.stop()
    return true
  }))

  ipcMain.handle(IPC.AUDIO_PERMISSIONS, wrapHandler(async () => {
    if (process.platform === 'darwin') {
      const micStatus = systemPreferences.getMediaAccessStatus('microphone')
      if (micStatus === 'granted') return true
      if (micStatus === 'not-determined') {
        return systemPreferences.askForMediaAccess('microphone')
      }
      return false
    }
    return true
  }))
}
