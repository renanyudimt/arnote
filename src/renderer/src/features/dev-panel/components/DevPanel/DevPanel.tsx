import { useState, useEffect, useRef } from 'react'

import { X, Trash2, Bug } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { useDevLogs } from '../../hooks/useDevLogs'
import { LogLine } from '../LogLine'
import { NAMESPACES } from './constants'

export function DevPanel(): React.JSX.Element | null {
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<string>('All')
  const { logs, clear } = useDevLogs()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (isOpen && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, isOpen])

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-3 right-3 z-50 size-8 opacity-40 hover:opacity-100"
        onClick={() => setIsOpen(true)}
        title="Dev Panel (Ctrl+Shift+D)"
      >
        <Bug className="size-4" />
      </Button>
    )
  }

  const filtered = filter === 'All' ? logs : logs.filter((l) => l.namespace.includes(filter))

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex h-72 flex-col border-t bg-background/95 backdrop-blur">
      <div className="flex items-center gap-2 border-b px-3 py-1.5">
        <Bug className="size-4 text-muted-foreground" />
        <span className="text-xs font-semibold">Dev Panel</span>

        <div className="ml-4 flex gap-1">
          {NAMESPACES.map((ns) => (
            <button
              key={ns}
              onClick={() => setFilter(ns)}
              className={`rounded px-2 py-0.5 text-xs transition-colors ${
                filter === ns
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {ns}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <span className="mr-2 text-xs text-muted-foreground">{filtered.length} logs</span>
          <Button variant="ghost" size="icon" className="size-6" onClick={clear} title="Clear logs">
            <Trash2 className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={() => setIsOpen(false)}
            title="Close"
          >
            <X className="size-3" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            No logs yet. Main process logs will appear here.
          </div>
        ) : (
          filtered.map((entry, i) => <LogLine key={i} entry={entry} />)
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
