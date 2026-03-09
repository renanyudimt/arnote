import { useState } from 'react'

import { ipc } from '@/lib/ipc'

interface UseSessionExportReturn {
  exportSession: (sessionId: string) => Promise<string | null>
  exportError: string | null
}

export function useSessionExport(): UseSessionExportReturn {
  const [exportError, setExportError] = useState<string | null>(null)

  const exportSession = async (sessionId: string): Promise<string | null> => {
    try {
      setExportError(null)
      return await ipc.session.exportMd(sessionId)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setExportError(message)
      return null
    }
  }

  return { exportSession, exportError }
}
