export const NAMESPACE_COLORS: Record<string, string> = {
  Whisper: 'text-blue-400',
  Realtime: 'text-purple-400',
  Summary: 'text-green-400',
  Settings: 'text-yellow-400',
}

export const LEVEL_STYLES: Record<string, string> = {
  debug: 'text-muted-foreground',
  info: 'text-foreground',
  warn: 'text-yellow-500',
  error: 'text-red-500',
}

export const NAMESPACES = ['All', 'Whisper', 'Realtime', 'Summary', 'Settings'] as const

export const DEFAULT_NAMESPACE_COLOR = 'text-cyan-400'
