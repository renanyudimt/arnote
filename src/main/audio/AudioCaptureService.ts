export class AudioCaptureService {
  private isRecording = false

  start(): void {
    if (this.isRecording) return
    this.isRecording = true
    console.log('[AudioCaptureService] Started capturing audio')
  }

  stop(): void {
    if (!this.isRecording) return
    this.isRecording = false
    console.log('[AudioCaptureService] Stopped capturing audio')
  }

  getIsRecording(): boolean {
    return this.isRecording
  }
}
