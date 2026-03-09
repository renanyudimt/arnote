export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children?: React.ReactNode
  footer?: React.ReactNode
  cancelLabel?: string
  confirmLabel?: string
  onConfirm?: () => void
  confirmVariant?: 'default' | 'destructive'
}
