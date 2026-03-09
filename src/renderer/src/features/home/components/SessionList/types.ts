import type { Session } from '@/types/session'

export interface SessionListProps {
  sessions: Session[]
  onSessionClick: (id: string) => void
  onDelete: (id: string) => void
}
