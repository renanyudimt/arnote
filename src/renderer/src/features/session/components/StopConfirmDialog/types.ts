export interface StopConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (generateSummary: boolean) => void
}
