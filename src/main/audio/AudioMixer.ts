import { createLogger } from '../lib/logger'

const log = createLogger('AudioMixer')

const FLUSH_INTERVAL_MS = 100

export class AudioMixer {
  private systemBuffer: Buffer[] = []
  private micBuffer: Buffer[] = []
  private onMixedChunk: ((buffer: Buffer) => void) | null = null
  private flushTimer: ReturnType<typeof setInterval> | null = null
  private flushedFirstChunk = false

  appendSystemChunk(buffer: Buffer): void {
    this.systemBuffer.push(buffer)
  }

  appendMicChunk(buffer: Buffer): void {
    this.micBuffer.push(buffer)
  }

  setOnMixedChunk(callback: (buffer: Buffer) => void): void {
    this.onMixedChunk = callback
  }

  start(): void {
    this.flushedFirstChunk = false
    this.flushTimer = setInterval(() => this.flush(), FLUSH_INTERVAL_MS)
    log.info('Mixer started')
  }

  stop(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }
    this.systemBuffer = []
    this.micBuffer = []
    this.flushedFirstChunk = false
    log.info('Mixer stopped')
  }

  private flush(): void {
    if (!this.onMixedChunk) return

    const systemData = this.drainBuffer(this.systemBuffer)
    const micData = this.drainBuffer(this.micBuffer)

    if (!systemData && !micData) return

    if (!this.flushedFirstChunk) {
      this.flushedFirstChunk = true
      const sources = [systemData ? 'system' : null, micData ? 'mic' : null]
        .filter(Boolean)
        .join('+')
      const totalBytes = (systemData?.byteLength ?? 0) + (micData?.byteLength ?? 0)
      log.info(`First mixed chunk flushed (${totalBytes} bytes, sources: ${sources})`)
    }

    // If one stream is empty, pass the other directly
    if (!systemData && micData) {
      this.onMixedChunk(micData)
      return
    }
    if (systemData && !micData) {
      this.onMixedChunk(systemData)
      return
    }

    // Both streams have data — mix them
    if (systemData && micData) {
      const mixed = this.mixBuffers(systemData, micData)
      this.onMixedChunk(mixed)
    }
  }

  private drainBuffer(buffers: Buffer[]): Buffer | null {
    if (buffers.length === 0) return null

    const total = Buffer.concat(buffers)
    buffers.length = 0
    return total
  }

  private mixBuffers(a: Buffer, b: Buffer): Buffer {
    const asamples = new Int16Array(a.buffer, a.byteOffset, a.byteLength / 2)
    const bsamples = new Int16Array(b.buffer, b.byteOffset, b.byteLength / 2)

    const minLen = Math.min(asamples.length, bsamples.length)
    const maxLen = Math.max(asamples.length, bsamples.length)
    const output = new Int16Array(maxLen)

    // Mix overlapping region with clamping
    for (let i = 0; i < minLen; i++) {
      const sum = asamples[i] + bsamples[i]
      output[i] = Math.max(-32768, Math.min(32767, sum))
    }

    // Copy remainder from the longer buffer
    const longer = asamples.length > bsamples.length ? asamples : bsamples
    for (let i = minLen; i < maxLen; i++) {
      output[i] = longer[i]
    }

    return Buffer.from(output.buffer)
  }
}
