import type { Session } from '@/types/session'

export interface SessionCardProps {
  session: Session
  onClick: (id: string) => void
}
