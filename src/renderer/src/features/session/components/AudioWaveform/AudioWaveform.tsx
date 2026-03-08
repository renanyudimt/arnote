import type { AudioWaveformProps } from './types'

const BAR_COUNT = 5
const MIN_HEIGHT = 4
const MAX_HEIGHT = 24

const BAR_OFFSETS = [0.6, 1.0, 0.8, 0.9, 0.5]

export function AudioWaveform({ level }: AudioWaveformProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-0.5">
      {BAR_OFFSETS.slice(0, BAR_COUNT).map((offset, i) => {
        const barLevel = Math.min(1, level * offset)
        const height = MIN_HEIGHT + barLevel * (MAX_HEIGHT - MIN_HEIGHT)

        return (
          <div
            key={i}
            className="w-0.5 rounded-full bg-primary transition-all duration-75"
            style={{ height: `${height}px` }}
          />
        )
      })}
    </div>
  )
}
