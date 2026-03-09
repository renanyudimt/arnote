import { randomUUID } from 'crypto'

import { net } from 'electron'
import type { BrowserWindow } from 'electron'

import { HALLUCINATION_PATTERNS } from './constants'
import { encodeWav } from './wavEncoder'
import { IPC } from '../ipc/constants'
import { formatApiError } from '../lib/apiErrors'
import { createLogger } from '../lib/logger'

import type { TranscriptChunk } from './OpenAIRealtimeClient'

const logger = createLogger('Whisper')

const FLUSH_INTERVAL_MS = 10_000
const SAMPLE_RATE = 24000

function isHallucination(text: string): boolean {
  const trimmed = text.trim()
  return HALLUCINATION_PATTERNS.some((pattern) => pattern.test(trimmed))
}

export class WhisperBatchClient {
  private window: BrowserWindow | null = null
  private apiKey = ''
  private baseUrl = 'https://api.openai.com'
  private modelName = 'whisper-1'
  private chunks: Buffer[] = []
  private flushTimer: ReturnType<typeof setInterval> | null = null
  private isRunning = false

  setWindow(window: BrowserWindow): void {
    this.window = window
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey
  }

  setBaseUrl(url: string): void {
    this.baseUrl = url
  }

  setModelName(name: string): void {
    this.modelName = name
  }

  start(): void {
    if (this.isRunning) {
      logger.warn('Already running — resetting before restart')
      this.forceStop()
    }
    this.isRunning = true
    this.chunks = []

    this.flushTimer = setInterval(() => {
      logger.debug(`Flush timer fired (${this.chunks.length} chunks pending)`)
      this.flush().catch((error) => {
        logger.error('Flush error:', error)
        this.sendErrorToRenderer(String(error))
      })
    }, FLUSH_INTERVAL_MS)

    logger.info('Started')
  }

  stop(): void {
    if (!this.isRunning) return
    this.isRunning = false

    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }

    // Flush remaining audio
    if (this.chunks.length > 0) {
      this.flush().catch((error) => {
        logger.error('Final flush error:', error)
      })
    }

    logger.info('Stopped')
  }

  /** Force-stop without flushing remaining chunks — used for stale state recovery */
  private forceStop(): void {
    this.isRunning = false
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }
    this.chunks = []
  }

  appendChunk(buffer: Buffer): void {
    if (!this.isRunning) {
      logger.warn('appendChunk called but not running — dropping chunk')
      return
    }
    this.chunks.push(buffer)
    if (this.chunks.length === 1) {
      logger.info('First audio chunk received in buffer')
    }
  }

  private async flush(): Promise<void> {
    if (this.chunks.length === 0) return

    const chunkCount = this.chunks.length
    const pcmData = Buffer.concat(this.chunks)
    this.chunks = []

    // Compute RMS to diagnose silent audio
    const samples = new Int16Array(pcmData.buffer, pcmData.byteOffset, pcmData.byteLength / 2)
    let sumSquares = 0
    for (let i = 0; i < samples.length; i++) {
      const n = samples[i] / 32768
      sumSquares += n * n
    }
    const rms = Math.sqrt(sumSquares / samples.length)
    logger.info(`Flushing ${chunkCount} chunks (${pcmData.byteLength} bytes, RMS: ${rms.toFixed(6)})`)

    const wav = encodeWav(pcmData, SAMPLE_RATE)

    const boundary = `----formdata-${randomUUID()}`
    const fileName = 'audio.wav'

    const preamble = Buffer.from(
      `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
        `Content-Type: audio/wav\r\n\r\n`
    )
    const modelField = Buffer.from(
      `\r\n--${boundary}\r\nContent-Disposition: form-data; name="model"\r\n\r\n${this.modelName}`
    )
    const languageField = Buffer.from(
      `\r\n--${boundary}\r\n` +
        `Content-Disposition: form-data; name="response_format"\r\n\r\n` +
        `text`
    )
    const epilogue = Buffer.from(`\r\n--${boundary}--\r\n`)

    const body = Buffer.concat([preamble, wav, modelField, languageField, epilogue])

    try {
      const text = await new Promise<string>((resolve, reject) => {
        const headers: Record<string, string> = {
          'Content-Type': `multipart/form-data; boundary=${boundary}`
        }
        if (this.apiKey) {
          headers['Authorization'] = `Bearer ${this.apiKey}`
        }
        const request = net.request({
          method: 'POST',
          url: `${this.baseUrl}/v1/audio/transcriptions`,
          headers
        })

        let responseData = ''

        request.on('response', (response) => {
          response.on('data', (chunk: Buffer) => {
            responseData += chunk.toString()
          })

          response.on('end', () => {
            if (response.statusCode === 200) {
              resolve(responseData.trim())
            } else {
              reject(new Error(formatApiError(response.statusCode, responseData)))
            }
          })
        })

        request.on('error', reject)
        request.write(body)
        request.end()
      })

      logger.info(`Whisper response: "${text.slice(0, 100)}"`)

      if (text.length > 0 && !isHallucination(text)) {
        const chunk: TranscriptChunk = {
          id: randomUUID(),
          timestamp: Date.now(),
          text
        }
        this.sendChunkToRenderer(chunk)
      } else if (text.length > 0) {
        logger.info('Filtered hallucination:', text)
      }
    } catch (error) {
      logger.error('Transcription error:', error)
      this.sendErrorToRenderer(error instanceof Error ? error.message : String(error))
    }
  }

  private sendChunkToRenderer(chunk: TranscriptChunk): void {
    if (this.window && !this.window.isDestroyed()) {
      this.window.webContents.send(IPC.TRANSCRIPTION_CHUNK, chunk)
    }
  }

  private sendErrorToRenderer(error: string): void {
    if (this.window && !this.window.isDestroyed()) {
      this.window.webContents.send(IPC.TRANSCRIPTION_ERROR, error)
    }
  }
}
