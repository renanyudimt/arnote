import { LEVEL_STYLES } from '../DevPanel/constants'
import { getNamespaceColor, formatLogTime } from '../DevPanel/utils'

import type { LogLineProps } from './types'

export function LogLine({ entry }: LogLineProps): React.JSX.Element {
  return (
    <div className="flex gap-2 border-b border-border/30 px-3 py-1 font-mono text-xs leading-5">
      <span className="shrink-0 text-muted-foreground">{formatLogTime(entry.timestamp)}</span>
      <span className={`shrink-0 font-semibold ${getNamespaceColor(entry.namespace)}`}>
        {entry.namespace}
      </span>
      <span className={LEVEL_STYLES[entry.level] ?? 'text-foreground'}>{entry.message}</span>
    </div>
  )
}
