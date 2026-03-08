import { ipc } from '@/lib/ipc'

export function useSessionExport(): {
  exportSession: (sessionId: string) => Promise<string | null>
} {
  const exportSession = async (sessionId: string): Promise<string | null> => ipc.session.exportMd(sessionId)
  return { exportSession }
}
