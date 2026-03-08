import macosAudioDevices from 'macos-audio-devices'

const { getOutputDevices, getDefaultOutputDevice, setDefaultOutputDevice } = macosAudioDevices

interface OutputDevice {
  id: number
  uid: string
  name: string
}

function toOutputDevice(device: { id: number; uid: string; name: string }): OutputDevice {
  return { id: device.id, uid: device.uid, name: device.name }
}

export class OutputDeviceService {
  async getOutputDevices(): Promise<OutputDevice[]> {
    const devices = await getOutputDevices()
    return devices.map(toOutputDevice)
  }

  async getDefaultOutputDevice(): Promise<OutputDevice> {
    const device = await getDefaultOutputDevice()
    return toOutputDevice(device)
  }

  async setDefaultOutputDevice(deviceId: number): Promise<void> {
    await setDefaultOutputDevice(deviceId)
  }
}
