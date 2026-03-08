import { format } from 'date-fns'
import { FileText, Clock } from 'lucide-react'

import { Badge } from '@/components/ui/badge'

import { SESSION_STATUS_BADGE_VARIANT } from './constants'

import type { SessionCardProps } from './types'

export function SessionCard({ session, onClick }: SessionCardProps): React.JSX.Element {
  return (
    <button
      onClick={() => onClick(session.id)}
      className="flex w-full flex-col gap-2 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-accent"
    >
      <div className="flex items-start justify-between">
        <h3 className="font-semibold">{session.title}</h3>
        <Badge variant={SESSION_STATUS_BADGE_VARIANT[session.status]}>{session.status}</Badge>
      </div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="size-3.5" />
          {format(new Date(session.createdAt), 'MMM d, yyyy HH:mm')}
        </span>
        <span className="flex items-center gap-1">
          <FileText className="size-3.5" />
          {session.transcript.length} entries
        </span>
      </div>
      {session.summary && (
        <p className="line-clamp-2 text-sm text-muted-foreground">{session.summary.fullSummary}</p>
      )}
    </button>
  )
}
