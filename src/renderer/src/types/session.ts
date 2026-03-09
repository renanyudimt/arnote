export interface TranscriptEntry {
  id: string
  timestamp: number
  text: string
  speaker?: string
}

export interface Summary {
  title: string
  keyPoints: string[]
  actionItems: string[]
  fullSummary: string
}

export type SummaryLanguage = 'pt' | 'en'

export interface Session {
  id: string
  createdAt: string
  endedAt: string | null
  title: string
  transcript: TranscriptEntry[]
  summary: Summary | null
  status: 'recording' | 'summarizing' | 'completed'
  filePath: string | null
}

export interface ProcessingNavigationState {
  transcript: TranscriptEntry[]
  language: SummaryLanguage
  curationEnabled: boolean
  curationGlossary: string[]
}
