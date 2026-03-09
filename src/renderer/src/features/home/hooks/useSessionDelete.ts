import { useState, useCallback } from 'react'

import { ipc } from '@/lib/ipc'
import { useSessionStore } from '@/stores/sessionStore'

interface UseSessionDeleteReturn {
  deleteTargetId: string | null
  deleteError: string | null
  requestDelete: (id: string) => void
  confirmDelete: () => Promise<void>
  cancelDelete: () => void
}

export function useSessionDelete(): UseSessionDeleteReturn {
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const requestDelete = useCallback((id: string): void => {
    setDeleteTargetId(id)
    setDeleteError(null)
  }, [])

  const confirmDelete = useCallback(async (): Promise<void> => {
    if (!deleteTargetId) return

    try {
      await ipc.session.delete(deleteTargetId)
      useSessionStore.getState().removeSession(deleteTargetId)
      setDeleteTargetId(null)
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : String(err))
    }
  }, [deleteTargetId])

  const cancelDelete = useCallback((): void => {
    setDeleteTargetId(null)
    setDeleteError(null)
  }, [])

  return { deleteTargetId, deleteError, requestDelete, confirmDelete, cancelDelete }
}
