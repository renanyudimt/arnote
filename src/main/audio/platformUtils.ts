import { execSync } from 'child_process'

export function isNativeAudioSupported(): boolean {
  if (process.platform !== 'darwin') return false

  try {
    const kernelVersion = execSync('uname -r', { encoding: 'utf-8' }).trim()
    const [major, minor] = kernelVersion.split('.').map(Number)

    // macOS 14.2 corresponds to Darwin kernel 23.2
    if (major > 23) return true
    if (major === 23 && minor >= 2) return true

    return false
  } catch {
    return false
  }
}
