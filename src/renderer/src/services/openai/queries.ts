import { useQuery } from '@tanstack/react-query'

import { ipc } from '@/lib/ipc'
import type { Session } from '@/types/session'

import { openaiKeys } from './keys'


export function useSessionQuery(id: string) {
  return useQuery<Session>({
    queryKey: openaiKeys.session(id),
    queryFn: () => ipc.session.get(id),
    enabled: !!id
  })
}

export function useSessionsQuery() {
  return useQuery<Session[]>({
    queryKey: openaiKeys.sessions(),
    queryFn: () => ipc.session.list()
  })
}
