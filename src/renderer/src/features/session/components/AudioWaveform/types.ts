export type AudioWaveformVariant = 'system' | 'mic'

export interface AudioWaveformProps {
  level: number
  variant?: AudioWaveformVariant
}
