import { randomUUID } from 'crypto'

import type { BrowserWindow } from 'electron'

import WebSocket from 'ws'

import { HALLUCINATION_PATTERNS } from './constants'
import { IPC } from '../ipc/constants'
import { formatApiError } from '../lib/apiErrors'
import { createLogger } from '../lib/logger'


const logger = createLogger('Realtime')

export interface TranscriptChunk {
  id: string
  timestamp: number
  text: string
  speaker?: string
}

const REALTIME_URL = 'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview'
const MAX_RECONNECT_ATTEMPTS = 3
const BASE_RECONNECT_DELAY_MS = 1000

function isHallucination(text: string): boolean {
  const trimmed = text.trim()
  return HALLUCINATION_PATTERNS.some((pattern) => pattern.test(trimmed))
}

export class OpenAIRealtimeClient {
  private window: BrowserWindow | null = null
  private ws: WebSocket | null = null
  private apiKey = ''
  private isConnected = false
  private reconnectAttempts = 0
  private shouldReconnect = false

  setWindow(window: BrowserWindow): void {
    this.window = window
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey
  }

  async connect(): Promise<void> {
    if (this.isConnected) return
    this.shouldReconnect = true
    this.reconnectAttempts = 0

    await this.openConnection()
  }

  disconnect(): void {
    this.shouldReconnect = false

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.isConnected = false
    logger.info('Disconnected')
  }

  sendAudioChunk(buffer: Buffer): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return
    if (!buffer || buffer.length === 0) return

    const safeBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer)
    const base64 = safeBuffer.toString('base64')
    this.ws.send(
      JSON.stringify({
        type: 'input_audio_buffer.append',
        audio: base64
      })
    )
  }

  sendChunkToRenderer(chunk: TranscriptChunk): void {
    if (this.window && !this.window.isDestroyed()) {
      this.window.webContents.send(IPC.TRANSCRIPTION_CHUNK, chunk)
    }
  }

  sendErrorToRenderer(error: string): void {
    if (this.window && !this.window.isDestroyed()) {
      this.window.webContents.send(IPC.TRANSCRIPTION_ERROR, error)
    }
  }

  private async openConnection(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.ws = new WebSocket(REALTIME_URL, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'OpenAI-Beta': 'realtime=v1'
        }
      })

      this.ws.on('open', () => {
        logger.info('WebSocket connected')
        this.isConnected = true
        this.reconnectAttempts = 0

        this.sendSessionUpdate()
        resolve()
      })

      this.ws.on('message', (data: WebSocket.Data) => {
        this.handleMessage(data)
      })

      this.ws.on('close', () => {
        this.isConnected = false
        logger.info('WebSocket closed')
        this.attemptReconnect()
      })

      this.ws.on('error', (error: Error) => {
        logger.error('WebSocket error:', error.message)
        const statusMatch = error.message.match(/(\d{3})/)
        const statusCode = statusMatch ? parseInt(statusMatch[1], 10) : 0
        const friendlyError =
          statusCode > 0
            ? formatApiError(statusCode, error.message)
            : `WebSocket error: ${error.message}`
        this.sendErrorToRenderer(friendlyError)

        if (!this.isConnected) {
          reject(error)
        }
      })
    })
  }

  private sendSessionUpdate(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return

    this.ws.send(
      JSON.stringify({
        type: 'session.update',
        session: {
          modalities: ['text'],
          input_audio_format: 'pcm16',
          input_audio_transcription: {
            model: 'gpt-4o-mini-transcribe'
          },
          turn_detection: {
            type: 'server_vad'
          }
        }
      })
    )
  }

  private handleMessage(data: WebSocket.Data): void {
    try {
      const raw = typeof data === 'string' ? data : Buffer.from(data as ArrayBuffer).toString()
      const message = JSON.parse(raw) as Record<string, unknown>
      const type = message.type as string

      if (type === 'conversation.item.input_audio_transcription.completed') {
        const text = message.transcript as string
        if (text && text.trim().length > 0 && !isHallucination(text)) {
          this.sendChunkToRenderer({
            id: randomUUID(),
            timestamp: Date.now(),
            text: text.trim()
          })
        } else if (text && isHallucination(text)) {
          logger.info('Filtered hallucination:', text.trim())
        }
      } else if (type === 'error') {
        const errorObj = message.error as Record<string, unknown> | undefined
        const errorMessage = (errorObj?.message as string) || 'Unknown Realtime API error'
        logger.error('API error:', errorMessage)
        this.sendErrorToRenderer(errorMessage)
      }
    } catch (error) {
      logger.error('Failed to parse message:', error)
    }
  }

  private attemptReconnect(): void {
    if (!this.shouldReconnect) return
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      logger.error('Max reconnect attempts reached')
      this.sendErrorToRenderer('Connection lost. Max reconnect attempts reached.')
      return
    }

    this.reconnectAttempts++
    const delay = BASE_RECONNECT_DELAY_MS * Math.pow(2, this.reconnectAttempts - 1)

    logger.info(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)

    setTimeout(() => {
      if (!this.shouldReconnect) return
      this.openConnection().catch((error) => {
        logger.error('Reconnect failed:', error)
      })
    }, delay)
  }
}
