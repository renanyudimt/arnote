import { format } from 'date-fns'
import { FileText, Clock, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import { SESSION_STATUS_BADGE_VARIANT } from './constants'

import type { SessionCardProps } from './types'

export function SessionCard({ session, onClick, onDelete }: SessionCardProps): React.JSX.Element {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(session.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick(session.id)
      }}
      className="flex w-full cursor-pointer flex-col gap-2 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-accent"
    >
      <div className="flex items-start justify-between">
        <h3 className="flex-1 font-semibold">{session.title}</h3>
        <div className="flex items-center gap-2">
          <Badge variant={SESSION_STATUS_BADGE_VARIANT[session.status]}>{session.status}</Badge>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(session.id)
            }}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
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
    </div>
  )
}
