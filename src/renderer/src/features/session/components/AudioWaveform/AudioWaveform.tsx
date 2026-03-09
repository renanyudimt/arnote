import { cn } from '@/lib/utils'

import { BAR_COUNT, MIN_HEIGHT, MAX_HEIGHT, BAR_OFFSETS, VARIANT_COLORS } from './constants'

import type { AudioWaveformProps } from './types'

export function AudioWaveform({ level, variant = 'system' }: AudioWaveformProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-0.5">
      {BAR_OFFSETS.slice(0, BAR_COUNT).map((offset, i) => {
        const barLevel = Math.min(1, level * offset)
        const height = MIN_HEIGHT + barLevel * (MAX_HEIGHT - MIN_HEIGHT)

        return (
          <div
            key={i}
            className={cn('w-1 rounded-full transition-all duration-75', VARIANT_COLORS[variant])}
            style={{ height: `${height}px` }}
          />
        )
      })}
    </div>
  )
}
