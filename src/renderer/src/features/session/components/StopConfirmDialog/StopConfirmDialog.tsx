import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

import { DIALOG_LABELS } from './constants'

import type { StopConfirmDialogProps } from './types'

export function StopConfirmDialog({
  open,
  onOpenChange,
  onConfirm
}: StopConfirmDialogProps): React.JSX.Element {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{DIALOG_LABELS.TITLE}</DialogTitle>
          <DialogDescription>{DIALOG_LABELS.DESCRIPTION}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onConfirm(false)}>
            {DIALOG_LABELS.SKIP}
          </Button>
          <Button onClick={() => onConfirm(true)}>{DIALOG_LABELS.GENERATE}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
