import { useState } from 'react'

import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Button } from '@/components/ui/button'
import type { SummaryLanguage } from '@/types/session'

import { DIALOG_LABELS, LANGUAGE_OPTIONS } from './constants'

import type { StopConfirmDialogProps } from './types'

export function StopConfirmDialog({
  open,
  onOpenChange,
  onConfirm
}: StopConfirmDialogProps): React.JSX.Element {
  const [language, setLanguage] = useState<SummaryLanguage>('pt')

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={DIALOG_LABELS.TITLE}
      description={DIALOG_LABELS.DESCRIPTION}
      footer={
        <>
          <Button variant="outline" onClick={() => onConfirm(false)}>
            {DIALOG_LABELS.SKIP}
          </Button>
          <Button onClick={() => onConfirm(true, language)}>{DIALOG_LABELS.GENERATE}</Button>
        </>
      }
    >
      <div className="flex items-center gap-2">
        {LANGUAGE_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant={language === option.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLanguage(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </ConfirmDialog>
  )
}
