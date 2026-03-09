import { EventEmitter } from 'events'

import { AudioTee } from 'audiotee'

import {
  SAMPLE_RATE,
  SILENCE_THRESHOLD,
  SILENCE_CHECK_INTERVAL_MS,
  SILENCE_CONFIRM_MS,
  RECOVERY_CONFIRM_MS,
  STARTUP_GRACE_MS,
} from './constants'
import { createLogger } from '../lib/logger'

const log = createLogger('NativeAudioCapture')

const NO_DATA_TIMEOUT_MS = 5000

interface NativeAudioCaptureEvents {
  chunk: (buffer: Buffer) => void
  silence: (isSilent: boolean) => void
  level: (level: number) => void
  error: (error: Error) => void
}

export class NativeAudioCapture extends EventEmitter {
  private audioTee: AudioTee | null = null
  private silenceCheckInterval: ReturnType<typeof setInterval> | null = null
  private levelThrottleTimer: ReturnType<typeof setTimeout> | null = null
  private noDataTimer: ReturnType<typeof setTimeout> | null = null
  private lastLevelEmitTime = 0
  private consecutiveSilentChecks = 0
  private consecutiveActiveChecks = 0
  private reportedSilent = false
  private startTime = 0
  private latestRms = 0
  private receivedFirstChunk = false

  override on<K extends keyof NativeAudioCaptureEvents>(
    event: K,
    listener: NativeAudioCaptureEvents[K]
  ): this {
    return super.on(event, listener)
  }

  override emit<K extends keyof NativeAudioCaptureEvents>(
    event: K,
    ...args: Parameters<NativeAudioCaptureEvents[K]>
  ): boolean {
    return super.emit(event, ...args)
  }

  async start(): Promise<void> {
    if (this.audioTee) {
      log.warn('AudioTee still referenced from previous session — stopping first')
      await this.stop()
    }

    log.info('Starting AudioTee...')

    this.audioTee = new AudioTee({ sampleRate: SAMPLE_RATE })
    this.receivedFirstChunk = false

    this.audioTee.on('start', () => {
      log.info('Audio tap connected — stream started')
    })

    this.audioTee.on('stop', () => {
      log.warn('Audio tap disconnected — stream stopped')
    })

    this.audioTee.on('log', (messageType: string, data: unknown) => {
      log.debug('AudioTee log:', messageType, data)
    })

    this.audioTee.on('data', ({ data }: { data: Buffer }) => {
      if (!this.receivedFirstChunk) {
        this.receivedFirstChunk = true
        log.info(`First audio chunk received (${data.byteLength} bytes)`)
        this.clearNoDataTimer()
      }
      this.emit('chunk', data)
      this.processAudioLevel(data)
    })

    this.audioTee.on('error', (error: Error) => {
      log.error('AudioTee error:', error.message)
      this.emit('error', error)
    })

    this.startTime = Date.now()
    this.resetSilenceState()
    this.startSilenceDetection()
    this.startNoDataTimer()

    await this.audioTee.start()

    log.info('AudioTee process spawned')
  }

  async stop(): Promise<void> {
    log.info('Stopping AudioTee...')

    this.clearNoDataTimer()

    if (this.silenceCheckInterval) {
      clearInterval(this.silenceCheckInterval)
      this.silenceCheckInterval = null
    }

    if (this.levelThrottleTimer) {
      clearTimeout(this.levelThrottleTimer)
      this.levelThrottleTimer = null
    }

    if (this.audioTee) {
      await this.audioTee.stop()
      this.audioTee.removeAllListeners()
      this.audioTee = null
    }

    this.resetSilenceState()
    log.info('AudioTee stopped')
  }

  isRunning(): boolean {
    return this.audioTee?.isActive() ?? false
  }

  private startNoDataTimer(): void {
    this.noDataTimer = setTimeout(() => {
      if (!this.receivedFirstChunk) {
        const msg = 'No audio data received within 5s — system audio capture may require permission'
        log.warn(msg)
        this.emit('error', new Error(msg))
      }
    }, NO_DATA_TIMEOUT_MS)
  }

  private clearNoDataTimer(): void {
    if (this.noDataTimer) {
      clearTimeout(this.noDataTimer)
      this.noDataTimer = null
    }
  }

  private resetSilenceState(): void {
    this.consecutiveSilentChecks = 0
    this.consecutiveActiveChecks = 0
    this.reportedSilent = false
    this.latestRms = 0
  }

  private processAudioLevel(buffer: Buffer): void {
    const samples = new Int16Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 2)

    let sumSquares = 0
    for (let i = 0; i < samples.length; i++) {
      const normalized = samples[i] / 32768
      sumSquares += normalized * normalized
    }
    this.latestRms = Math.sqrt(sumSquares / samples.length)

    // Throttle level emission to ~60ms
    const now = Date.now()
    if (now - this.lastLevelEmitTime >= 60) {
      this.lastLevelEmitTime = now
      const level = Math.min(1, this.latestRms / 0.15)
      this.emit('level', level)
    }
  }

  private startSilenceDetection(): void {
    const silentChecksNeeded = Math.ceil(SILENCE_CONFIRM_MS / SILENCE_CHECK_INTERVAL_MS)
    const activeChecksNeeded = Math.ceil(RECOVERY_CONFIRM_MS / SILENCE_CHECK_INTERVAL_MS)

    this.silenceCheckInterval = setInterval(() => {
      // Skip during startup grace period
      if (Date.now() - this.startTime < STARTUP_GRACE_MS) return

      if (this.latestRms < SILENCE_THRESHOLD) {
        this.consecutiveSilentChecks++
        this.consecutiveActiveChecks = 0

        if (!this.reportedSilent && this.consecutiveSilentChecks >= silentChecksNeeded) {
          this.reportedSilent = true
          this.emit('silence', true)
        }
      } else {
        this.consecutiveActiveChecks++
        this.consecutiveSilentChecks = 0

        if (this.reportedSilent && this.consecutiveActiveChecks >= activeChecksNeeded) {
          this.reportedSilent = false
          this.emit('silence', false)
        }
      }
    }, SILENCE_CHECK_INTERVAL_MS)
  }
}
