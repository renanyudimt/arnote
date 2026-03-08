import { useEffect } from 'react'

import { ipc } from '@/lib/ipc'
import { useSessionStore } from '@/stores/sessionStore'
import type { Session } from '@/types/session'

export function useSessions(): {
  sessions: Session[]
  isLoading: boolean
  refresh: () => Promise<void>
} {
  const { sessions, isLoading, setSessions, setLoading } = useSessionStore()

  const refresh = async (): Promise<void> => {
    setLoading(true)
    try {
      const data = await ipc.session.list()
      setSessions(data)
    } catch (error) {
      console.error('Failed to load sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { sessions, isLoading, refresh }
}
