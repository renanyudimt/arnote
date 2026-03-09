import type { SummaryLanguage } from '@/types/session'

export interface StopConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (generateSummary: boolean, language?: SummaryLanguage) => void
}
