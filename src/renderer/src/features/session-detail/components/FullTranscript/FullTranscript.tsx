import type { FullTranscriptProps } from './types'

export function FullTranscript({ entries }: FullTranscriptProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3 p-4">
      {entries.map((entry) => (
        <div key={entry.id} className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {entry.speaker && <span className="font-medium">{entry.speaker}</span>}
            <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
          </div>
          <p className="text-sm">{entry.text}</p>
        </div>
      ))}
    </div>
  )
}
