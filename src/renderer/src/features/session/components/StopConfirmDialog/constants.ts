import type { SummaryLanguage } from '@/types/session'

export const DIALOG_LABELS = {
  TITLE: 'Stop Recording',
  DESCRIPTION: 'Would you like to generate an AI summary of this session?',
  SKIP: 'Skip Summary',
  GENERATE: 'Generate Summary',
} as const

interface LanguageOption {
  value: SummaryLanguage
  label: string
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: 'pt', label: '🇧🇷 Português' },
  { value: 'en', label: '🇺🇸 English' },
]
