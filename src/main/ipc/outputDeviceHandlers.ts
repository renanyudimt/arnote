import { ipcMain } from 'electron'

import { IPC } from './constants'
import { wrapHandler } from './utils'

import type { OutputDeviceService } from '../audio/OutputDeviceService'

export function registerOutputDeviceHandlers(outputDeviceService: OutputDeviceService): void {
  ipcMain.handle(IPC.AUDIO_OUTPUT_DEVICES, wrapHandler(async () =>
    outputDeviceService.getOutputDevices()
  ))

  ipcMain.handle(IPC.AUDIO_DEFAULT_OUTPUT, wrapHandler(async () =>
    outputDeviceService.getDefaultOutputDevice()
  ))

  ipcMain.handle(IPC.AUDIO_SET_OUTPUT, wrapHandler(async (deviceId: number) => {
    await outputDeviceService.setDefaultOutputDevice(deviceId)
  }))
}
