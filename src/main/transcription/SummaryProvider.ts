import type { Summary, TranscriptEntry } from './SummaryGenerator'

export interface SummaryProvider {
  configure(apiKey: string, model: string, baseUrl?: string): void
  generate(transcript: TranscriptEntry[], language?: string): Promise<Summary>
}
