export interface MeetingControlsProps {
  isRecording: boolean
  isMicMuted: boolean
  isPaused: boolean
  audioLevel?: number
  micLevel?: number
  onStart: () => void
  onStop: () => void
  onToggleMicMute: () => void
  onTogglePause: () => void
}
