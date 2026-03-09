import type { TranscriptEntry } from './SummaryGenerator'

export interface CurationProvider {
  configure(apiKey: string, model: string, baseUrl?: string): void
  curate(transcript: TranscriptEntry[], language?: string, glossary?: string[]): Promise<TranscriptEntry[]>
}
