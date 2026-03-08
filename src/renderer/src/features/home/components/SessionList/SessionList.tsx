import { SessionCard } from '../SessionCard'

import type { SessionListProps } from './types'

export function SessionList({ sessions, onSessionClick }: SessionListProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      {sessions.map((session) => (
        <SessionCard key={session.id} session={session} onClick={onSessionClick} />
      ))}
    </div>
  )
}
