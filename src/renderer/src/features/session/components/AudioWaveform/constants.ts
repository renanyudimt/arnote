import type { AudioWaveformVariant } from './types'

export const BAR_COUNT = 5
export const MIN_HEIGHT = 6
export const MAX_HEIGHT = 32
export const BAR_OFFSETS = [0.6, 1.0, 0.8, 0.9, 0.5]

export const VARIANT_COLORS: Record<AudioWaveformVariant, string> = {
  system: 'bg-primary',
  mic: 'bg-emerald-500 dark:bg-emerald-400'
}
