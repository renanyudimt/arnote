import { useState, useEffect, useRef } from 'react'

import { Mic, MicOff, Square } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { AudioWaveform } from '../AudioWaveform'
import { formatDuration } from './utils'

import type { MeetingControlsProps } from './types'

export function MeetingControls({
  isRecording,
  isMicMuted,
  audioLevel,
  onStart,
  onStop,
  onToggleMicMute
}: MeetingControlsProps): React.JSX.Element {
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRecording])

  const handleStart = (): void => {
    setElapsed(0)
    onStart()
  }

  return (
    <div className="flex items-center justify-between border-t p-4">
      <div className="flex items-center gap-3">
        <Button
          variant={isMicMuted ? 'secondary' : 'outline'}
          size="icon"
          onClick={onToggleMicMute}
        >
          {isMicMuted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
        </Button>
        {isRecording && (
          <>
            <span className="size-2.5 animate-pulse rounded-full bg-red-500" />
            <span className="font-mono text-sm">{formatDuration(elapsed)}</span>
            <AudioWaveform level={audioLevel ?? 0} />
          </>
        )}
      </div>
      {isRecording ? (
        <Button variant="destructive" onClick={onStop}>
          <Square className="size-4" />
          Stop
        </Button>
      ) : (
        <Button onClick={handleStart}>
          <Mic className="size-4" />
          Start Recording
        </Button>
      )}
    </div>
  )
}
