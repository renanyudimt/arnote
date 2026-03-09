import { useState, useEffect, useCallback } from 'react'

import { IPC } from '../../../../../preload/constants'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  level: LogLevel
  namespace: string
  message: string
  timestamp: number
}

const MAX_LOGS = 500

export function useDevLogs(): {
  logs: LogEntry[]
  clear: () => void
} {
  const [logs, setLogs] = useState<LogEntry[]>([])

  useEffect(() => {
    const handler = (_event: unknown, entry: LogEntry): void => {
      setLogs((prev) => {
        const next = [...prev, entry]
        if (next.length > MAX_LOGS) {
          return next.slice(next.length - MAX_LOGS)
        }
        return next
      })
    }

    window.electron.ipcRenderer.on(IPC.DEBUG_LOG, handler)
    return () => {
      window.electron.ipcRenderer.removeListener(IPC.DEBUG_LOG, handler)
    }
  }, [])

  const clear = useCallback(() => {
    setLogs([])
  }, [])

  return { logs, clear }
}
