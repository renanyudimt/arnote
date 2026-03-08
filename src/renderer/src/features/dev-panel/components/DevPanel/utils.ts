import { NAMESPACE_COLORS, DEFAULT_NAMESPACE_COLOR } from './constants'

export function getNamespaceColor(namespace: string): string {
  for (const [key, color] of Object.entries(NAMESPACE_COLORS)) {
    if (namespace.includes(key)) return color
  }
  return DEFAULT_NAMESPACE_COLOR
}

export function formatLogTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
