import { Separator } from '@/components/ui/separator'

import { SUMMARY_LABELS } from './constants'

import type { SummaryPanelProps } from './types'

export function SummaryPanel({ summary }: SummaryPanelProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold">{summary.title}</h2>
      <Separator />
      <div>
        <h3 className="mb-2 font-medium">{SUMMARY_LABELS.KEY_POINTS}</h3>
        <ul className="flex flex-col gap-1">
          {summary.keyPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
              {point}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="mb-2 font-medium">{SUMMARY_LABELS.ACTION_ITEMS}</h3>
        <ul className="flex flex-col gap-1">
          {summary.actionItems.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="mt-0.5">{SUMMARY_LABELS.CHECKBOX}</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <Separator />
      <div>
        <h3 className="mb-2 font-medium">{SUMMARY_LABELS.FULL_SUMMARY}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{summary.fullSummary}</p>
      </div>
    </div>
  )
}
