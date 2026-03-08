import { Mic } from 'lucide-react'

export function EmptyState(): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <Mic className="size-8 text-muted-foreground" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">No sessions yet</h3>
        <p className="text-sm text-muted-foreground">Start a meeting to begin transcribing</p>
      </div>
    </div>
  )
}
