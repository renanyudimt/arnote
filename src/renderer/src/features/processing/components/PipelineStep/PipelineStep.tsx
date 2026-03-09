import { Circle, Loader2, CheckCircle2, XCircle } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { PipelineStepProps, StepStatus } from './types'

const STATUS_ICONS: Record<StepStatus, React.JSX.Element> = {
  pending: <Circle className="size-5 text-muted-foreground" />,
  active: <Loader2 className="size-5 animate-spin text-blue-500" />,
  completed: <CheckCircle2 className="size-5 text-green-500" />,
  error: <XCircle className="size-5 text-red-500" />
}

export function PipelineStep({ label, status, errorMessage }: PipelineStepProps): React.JSX.Element {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0">{STATUS_ICONS[status]}</div>
      <div className="flex flex-col">
        <span
          className={cn(
            'text-sm font-medium',
            status === 'pending' && 'text-muted-foreground',
            status === 'active' && 'text-foreground',
            status === 'completed' && 'text-green-600 dark:text-green-400',
            status === 'error' && 'text-red-600 dark:text-red-400'
          )}
        >
          {label}
        </span>
        {errorMessage && (
          <span className="mt-1 text-xs text-red-500 dark:text-red-400">{errorMessage}</span>
        )}
      </div>
    </div>
  )
}
