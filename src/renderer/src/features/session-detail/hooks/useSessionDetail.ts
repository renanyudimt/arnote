import { useEffect, useState } from 'react'

import { ipc } from '@/lib/ipc'
import type { Session } from '@/types/session'

export function useSessionDetail(id: string): {
  session: Session | null
  isLoading: boolean
} {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async (): Promise<void> => {
      setIsLoading(true)
      try {
        const data = await ipc.session.get(id)
        setSession(data)
      } catch (error) {
        console.error('Failed to load session:', error)
      } finally {
        setIsLoading(false)
      }
    }
    void load()
  }, [id])

  return { session, isLoading }
}
