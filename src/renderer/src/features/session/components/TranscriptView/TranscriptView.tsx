import { useEffect, useRef } from 'react'

import { ScrollArea } from '@/components/ui/scroll-area'

import type { TranscriptViewProps } from './types'

export function TranscriptView({ entries }: TranscriptViewProps): React.JSX.Element {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries.length])

  if (entries.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        Waiting for transcription...
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1">
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
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}
