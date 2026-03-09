import type { TranscriptEntry, Summary, SummaryLanguage } from '@/types/session'

export interface CurationInput {
  transcript: TranscriptEntry[]
  language: SummaryLanguage
  glossary: string[]
}

export interface SummaryInput {
  transcript: TranscriptEntry[]
  language: SummaryLanguage
}

export type CurationOutput = TranscriptEntry[]

export type SummaryOutput = Summary
