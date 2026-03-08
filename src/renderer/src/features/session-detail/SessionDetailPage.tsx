import { useParams, useNavigate } from 'react-router-dom'

import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

import { FullTranscript, SummaryView, DownloadButton } from './components'
import { useSessionDetail } from './hooks/useSessionDetail'

export function SessionDetailPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { session, isLoading } = useSessionDetail(id!)

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col p-6">
        <Skeleton className="mb-4 h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Session not found</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="text-lg font-semibold">{session.title}</h1>
        </div>
        <DownloadButton sessionId={session.id} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        {session.summary && (
          <>
            <SummaryView summary={session.summary} />
            <Separator className="my-6" />
          </>
        )}

        <h2 className="mb-4 text-lg font-semibold">Transcript</h2>
        <FullTranscript entries={session.transcript} />
      </div>
    </div>
  )
}
