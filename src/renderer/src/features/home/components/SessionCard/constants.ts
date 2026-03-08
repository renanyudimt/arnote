import type { Session } from '@/types/session'

export const SESSION_STATUS_BADGE_VARIANT: Record<
  Session['status'],
  'destructive' | 'secondary' | 'default'
> = {
  recording: 'destructive',
  summarizing: 'secondary',
  completed: 'default',
}
