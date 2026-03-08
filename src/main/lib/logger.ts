import type { BrowserWindow } from 'electron'

import { IPC } from '../ipc/constants'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  namespace: string
  message: string
  timestamp: number
}

interface Logger {
  debug: (...args: unknown[]) => void
  info: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
  error: (...args: unknown[]) => void
}

let mainWindow: BrowserWindow | null = null

export function setLoggerWindow(window: BrowserWindow): void {
  mainWindow = window
}

function sendToRenderer(entry: LogEntry): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(IPC.DEBUG_LOG, entry)
  }
}

function formatArgs(args: unknown[]): string {
  return args
    .map((arg) => {
      if (typeof arg === 'string') return arg
      if (arg instanceof Error) return `${arg.message}\n${arg.stack ?? ''}`
      try {
        return JSON.stringify(arg)
      } catch {
        return String(arg)
      }
    })
    .join(' ')
}

export function createLogger(namespace: string): Logger {
  const log = (level: LogLevel, ...args: unknown[]): void => {
    const message = formatArgs(args)
    const prefix = `[${namespace}]`

    switch (level) {
      case 'debug':
        console.log(prefix, ...args)
        break
      case 'info':
        console.log(prefix, ...args)
        break
      case 'warn':
        console.warn(prefix, ...args)
        break
      case 'error':
        console.error(prefix, ...args)
        break
    }

    sendToRenderer({
      level,
      namespace,
      message,
      timestamp: Date.now()
    })
  }

  return {
    debug: (...args: unknown[]) => log('debug', ...args),
    info: (...args: unknown[]) => log('info', ...args),
    warn: (...args: unknown[]) => log('warn', ...args),
    error: (...args: unknown[]) => log('error', ...args)
  }
}
