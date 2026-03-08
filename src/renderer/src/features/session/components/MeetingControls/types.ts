export interface MeetingControlsProps {
  isRecording: boolean
  isMicMuted: boolean
  audioLevel?: number
  onStart: () => void
  onStop: () => void
  onToggleMicMute: () => void
}
