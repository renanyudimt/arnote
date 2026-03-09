import { useState, useEffect, useRef } from 'react'

import { Mic, MicOff, Pause, Play, Square, Volume2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { AudioWaveform } from '../AudioWaveform'
import { formatDuration } from './utils'

import type { MeetingControlsProps } from './types'

export function MeetingControls({
  isRecording,
  isMicMuted,
  isPaused,
  audioLevel,
  micLevel,
  onStart,
  onStop,
  onToggleMicMute,
  onTogglePause
}: MeetingControlsProps): React.JSX.Element {
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isRecording && !isPaused) {
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
  }, [isRecording, isPaused])

  const handleStart = (): void => {
    setElapsed(0)
    onStart()
  }

  return (
    <div className="flex items-center justify-between border-t px-4 py-5">
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
            <span
              className={
                isPaused
                  ? 'size-2.5 rounded-full bg-yellow-500'
                  : 'size-2.5 animate-pulse rounded-full bg-red-500'
              }
            />
            <span className="font-mono text-sm">{formatDuration(elapsed)}</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Volume2 className="size-3 text-muted-foreground" />
                <AudioWaveform level={isPaused ? 0 : (audioLevel ?? 0)} variant="system" />
              </div>
              <div className="flex items-center gap-1.5">
                <Mic className="size-3 text-muted-foreground" />
                <AudioWaveform
                  level={isPaused || isMicMuted ? 0 : (micLevel ?? 0)}
                  variant="mic"
                />
              </div>
            </div>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        {isRecording && (
          <Button
            variant={isPaused ? 'secondary' : 'outline'}
            size="icon"
            onClick={onTogglePause}
          >
            {isPaused ? <Play className="size-4" /> : <Pause className="size-4" />}
          </Button>
        )}
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
    </div>
  )
}
