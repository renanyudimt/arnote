import { SECONDS_PER_HOUR, SECONDS_PER_MINUTE, TIME_PAD_LENGTH } from './constants'

export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / SECONDS_PER_HOUR)
  const mins = Math.floor((seconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE)
  const secs = seconds % SECONDS_PER_MINUTE
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(TIME_PAD_LENGTH, '0')}:${String(secs).padStart(TIME_PAD_LENGTH, '0')}`
  }
  return `${String(mins).padStart(TIME_PAD_LENGTH, '0')}:${String(secs).padStart(TIME_PAD_LENGTH, '0')}`
}
