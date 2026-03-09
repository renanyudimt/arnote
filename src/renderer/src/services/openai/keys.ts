export const openaiKeys = {
  curation: () => ['openai', 'curation'] as const,
  summary: () => ['openai', 'summary'] as const,
  session: (id: string) => ['openai', 'session', id] as const,
  sessions: () => ['openai', 'sessions'] as const
}
