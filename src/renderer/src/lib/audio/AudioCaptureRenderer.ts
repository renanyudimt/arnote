const SAMPLE_RATE = 24000
const SILENCE_THRESHOLD = 0.001
const SILENCE_CHECK_INTERVAL_MS = 250
const SILENCE_CONFIRM_MS = 3000
const RECOVERY_CONFIRM_MS = 1000
const STARTUP_GRACE_MS = 5000

export type SystemAudioSource = 'loopback' | { deviceId: string }

export interface StartOptions {
  micDeviceId?: string
  systemAudioSource?: SystemAudioSource
  micOnly?: boolean
}

interface AudioCaptureOptions {
  onChunk: (buffer: ArrayBuffer) => void
  onMicChunk?: (buffer: ArrayBuffer) => void
  onSystemAudioSilent?: (isSilent: boolean) => void
  onAudioLevel?: (level: number) => void
  onMicLevel?: (level: number) => void
}

export class AudioCaptureRenderer {
  private audioContext: AudioContext | null = null
  private systemStream: MediaStream | null = null
  private micStream: MediaStream | null = null
  private micGainNode: GainNode | null = null
  private onChunk: (buffer: ArrayBuffer) => void
  private onMicChunk?: (buffer: ArrayBuffer) => void
  private onSystemAudioSilent?: (isSilent: boolean) => void
  private onAudioLevel?: (level: number) => void
  private onMicLevel?: (level: number) => void
  private _systemAudioAvailable = false
  private silenceCheckInterval: ReturnType<typeof setInterval> | null = null
  private analyserNode: AnalyserNode | null = null
  private audioLevelRafId: number | null = null
  private micAnalyserNode: AnalyserNode | null = null
  private micLevelRafId: number | null = null

  constructor(options: AudioCaptureOptions) {
    this.onChunk = options.onChunk
    this.onMicChunk = options.onMicChunk
    this.onSystemAudioSilent = options.onSystemAudioSilent
    this.onAudioLevel = options.onAudioLevel
    this.onMicLevel = options.onMicLevel
  }

  get systemAudioAvailable(): boolean {
    return this._systemAudioAvailable
  }

  private startSilenceDetection(systemSource: MediaStreamAudioSourceNode): void {
    if (!this.audioContext || !this.onSystemAudioSilent) return

    this.analyserNode = this.audioContext.createAnalyser()
    this.analyserNode.fftSize = 2048
    systemSource.connect(this.analyserNode)

    const bufferLength = this.analyserNode.fftSize
    const dataArray = new Float32Array(bufferLength)

    let consecutiveSilentChecks = 0
    let consecutiveActiveChecks = 0
    let reportedSilent = false
    const startTime = Date.now()

    const silentChecksNeeded = Math.ceil(SILENCE_CONFIRM_MS / SILENCE_CHECK_INTERVAL_MS)
    const activeChecksNeeded = Math.ceil(RECOVERY_CONFIRM_MS / SILENCE_CHECK_INTERVAL_MS)

    this.silenceCheckInterval = setInterval(() => {
      if (!this.analyserNode) return

      // Skip silence checks during startup grace period
      if (Date.now() - startTime < STARTUP_GRACE_MS) return

      this.analyserNode.getFloatTimeDomainData(dataArray)

      let sumSquares = 0
      for (let i = 0; i < bufferLength; i++) {
        sumSquares += dataArray[i] * dataArray[i]
      }
      const rms = Math.sqrt(sumSquares / bufferLength)

      if (rms < SILENCE_THRESHOLD) {
        consecutiveSilentChecks++
        consecutiveActiveChecks = 0

        if (!reportedSilent && consecutiveSilentChecks >= silentChecksNeeded) {
          reportedSilent = true
          console.warn('[AudioCapture] System audio silence detected')
          this.onSystemAudioSilent?.(true)
        }
      } else {
        consecutiveActiveChecks++
        consecutiveSilentChecks = 0

        if (reportedSilent && consecutiveActiveChecks >= activeChecksNeeded) {
          reportedSilent = false
          console.warn('[AudioCapture] System audio recovered from silence')
          this.onSystemAudioSilent?.(false)
        }
      }
    }, SILENCE_CHECK_INTERVAL_MS)
  }

  private async captureLoopbackAudio(): Promise<MediaStream> {
    await window.api.audio.enableLoopbackAudio()

    const stream = await navigator.mediaDevices.getDisplayMedia({
      audio: true,
      video: true
    })

    await window.api.audio.disableLoopbackAudio()

    // Remove video tracks — we only need audio
    const videoTracks = stream.getVideoTracks()
    videoTracks.forEach((track) => {
      track.stop()
      stream.removeTrack(track)
    })

    return stream
  }

  async start(options?: StartOptions): Promise<void> {
    this.audioContext = new AudioContext({ sampleRate: SAMPLE_RATE })

    const workletUrl = new URL('./pcm16-worklet.ts', import.meta.url)
    await this.audioContext.audioWorklet.addModule(workletUrl.href)

    const workletNode = new AudioWorkletNode(this.audioContext, 'pcm16-processor')

    if (options?.micOnly) {
      // In mic-only mode, send chunks via onMicChunk to main process for mixing
      workletNode.port.onmessage = (event: MessageEvent<ArrayBuffer>) => {
        this.onMicChunk?.(event.data)
      }
    } else {
      workletNode.port.onmessage = (event: MessageEvent<ArrayBuffer>) => {
        this.onChunk(event.data)
      }
    }

    // Skip system audio capture in mic-only mode (main process handles it via AudioTee)
    if (!options?.micOnly) {
      const systemAudioSource = options?.systemAudioSource ?? 'loopback'

      // Capture system audio
      try {
        if (systemAudioSource === 'loopback') {
          this.systemStream = await this.captureLoopbackAudio()
        } else {
          // Use getUserMedia with a specific input device (e.g., BlackHole virtual audio)
          try {
            this.systemStream = await navigator.mediaDevices.getUserMedia({
              audio: {
                deviceId: { exact: systemAudioSource.deviceId },
                sampleRate: SAMPLE_RATE,
                channelCount: 1
              }
            })
          } catch (deviceError) {
            const deviceMessage =
              deviceError instanceof Error ? deviceError.message : String(deviceError)
            console.warn(
              `[AudioCapture] Device "${systemAudioSource.deviceId}" unavailable: ${deviceMessage}. Falling back to loopback.`
            )
            this.systemStream = await this.captureLoopbackAudio()
          }
        }

        const systemSource = this.audioContext.createMediaStreamSource(this.systemStream)
        systemSource.connect(workletNode)
        this._systemAudioAvailable = true

        this.startSilenceDetection(systemSource)
        this.startAudioLevelLoop()
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`[AudioCapture] System audio capture failed: ${message}`, error)
        this._systemAudioAvailable = false
      }
    }

    // Capture microphone with GainNode for mute control
    try {
      const micConstraints: MediaTrackConstraints = {
        sampleRate: SAMPLE_RATE,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true
      }

      if (options?.micDeviceId) {
        micConstraints.deviceId = { exact: options.micDeviceId }
      }

      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: micConstraints
      })

      const micSource = this.audioContext.createMediaStreamSource(this.micStream)
      this.micGainNode = this.audioContext.createGain()
      micSource.connect(this.micGainNode)
      this.micGainNode.connect(workletNode)

      // Connect analyser directly to micSource (bypasses gain) so it reads raw level regardless of mute
      if (this.onMicLevel) {
        this.micAnalyserNode = this.audioContext.createAnalyser()
        this.micAnalyserNode.fftSize = 2048
        micSource.connect(this.micAnalyserNode)
        this.startMicLevelLoop()
      }
    } catch (error) {
      console.warn('Microphone capture failed:', error)
    }

    workletNode.connect(this.audioContext.destination)

    if (!options?.micOnly && !this.systemStream && !this.micStream) {
      throw new Error('No audio sources available')
    }

    if (options?.micOnly && !this.micStream) {
      throw new Error('Microphone not available')
    }
  }

  setMicMuted(muted: boolean): void {
    if (this.micGainNode) {
      this.micGainNode.gain.value = muted ? 0 : 1
    }
  }

  get isMicMuted(): boolean {
    if (!this.micGainNode) return false
    return this.micGainNode.gain.value === 0
  }

  private startAudioLevelLoop(): void {
    if (!this.analyserNode || !this.onAudioLevel) return

    const bufferLength = this.analyserNode.fftSize
    const dataArray = new Float32Array(bufferLength)

    const tick = (): void => {
      if (!this.analyserNode) return

      this.analyserNode.getFloatTimeDomainData(dataArray)

      let sumSquares = 0
      for (let i = 0; i < bufferLength; i++) {
        sumSquares += dataArray[i] * dataArray[i]
      }
      const rms = Math.sqrt(sumSquares / bufferLength)

      // Normalize: clamp RMS to 0–1 range (typical speech RMS is 0.01–0.15)
      const level = Math.min(1, rms / 0.15)
      this.onAudioLevel?.(level)

      this.audioLevelRafId = requestAnimationFrame(tick)
    }

    this.audioLevelRafId = requestAnimationFrame(tick)
  }

  private startMicLevelLoop(): void {
    if (!this.micAnalyserNode || !this.onMicLevel) return

    const bufferLength = this.micAnalyserNode.fftSize
    const dataArray = new Float32Array(bufferLength)

    const tick = (): void => {
      if (!this.micAnalyserNode) return

      this.micAnalyserNode.getFloatTimeDomainData(dataArray)

      let sumSquares = 0
      for (let i = 0; i < bufferLength; i++) {
        sumSquares += dataArray[i] * dataArray[i]
      }
      const rms = Math.sqrt(sumSquares / bufferLength)

      const level = Math.min(1, rms / 0.15)
      this.onMicLevel?.(level)

      this.micLevelRafId = requestAnimationFrame(tick)
    }

    this.micLevelRafId = requestAnimationFrame(tick)
  }

  async stop(): Promise<void> {
    if (this.audioLevelRafId !== null) {
      cancelAnimationFrame(this.audioLevelRafId)
      this.audioLevelRafId = null
    }

    if (this.micLevelRafId !== null) {
      cancelAnimationFrame(this.micLevelRafId)
      this.micLevelRafId = null
    }

    if (this.silenceCheckInterval) {
      clearInterval(this.silenceCheckInterval)
      this.silenceCheckInterval = null
    }

    this.analyserNode = null
    this.micAnalyserNode = null

    if (this.systemStream) {
      this.systemStream.getTracks().forEach((track) => track.stop())
      this.systemStream = null
    }

    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop())
      this.micStream = null
    }

    if (this.audioContext) {
      await this.audioContext.close()
      this.audioContext = null
    }
  }
}
