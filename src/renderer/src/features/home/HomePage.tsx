import { useNavigate } from 'react-router-dom'

import { Plus, Settings } from 'lucide-react'

import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { SessionList, EmptyState } from './components'
import { useSessionDelete } from './hooks/useSessionDelete'
import { useSessions } from './hooks/useSessions'

export function HomePage(): React.JSX.Element {
  const navigate = useNavigate()
  const { sessions, isLoading } = useSessions()
  const { deleteTargetId, requestDelete, confirmDelete, cancelDelete } = useSessionDelete()

  return (
    <div className="mx-auto flex h-screen max-w-2xl flex-col p-6">
      <div className="flex items-center justify-between pb-6">
        <h1 className="text-2xl font-bold">Arnote</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
            <Settings className="size-4" />
          </Button>
          <Button onClick={() => navigate('/session')}>
            <Plus className="size-4" />
            New Session
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <EmptyState />
        ) : (
          <SessionList
            sessions={sessions}
            onSessionClick={(id) => navigate(`/session/${id}`)}
            onDelete={requestDelete}
          />
        )}
      </div>
      <ConfirmDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => {
          if (!open) cancelDelete()
        }}
        title="Delete Session?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        confirmVariant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  )
}
