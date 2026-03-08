import { ipcMain } from 'electron'

import { IPC } from './constants'

import type { OutputDeviceService } from '../audio/OutputDeviceService'

export function registerOutputDeviceHandlers(outputDeviceService: OutputDeviceService): void {
  ipcMain.handle(IPC.AUDIO_OUTPUT_DEVICES, async () =>
    outputDeviceService.getOutputDevices()
  )

  ipcMain.handle(IPC.AUDIO_DEFAULT_OUTPUT, async () =>
    outputDeviceService.getDefaultOutputDevice()
  )

  ipcMain.handle(IPC.AUDIO_SET_OUTPUT, async (_event, deviceId: number) => {
    await outputDeviceService.setDefaultOutputDevice(deviceId)
  })
}
