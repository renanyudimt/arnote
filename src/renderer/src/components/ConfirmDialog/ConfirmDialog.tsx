import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'

import type { ConfirmDialogProps } from './types'

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  onConfirm,
  confirmVariant = 'default'
}: ConfirmDialogProps): React.JSX.Element {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        {children}
        <AlertDialogFooter>
          {footer ?? (
            <>
              <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
              <AlertDialogAction
                onClick={onConfirm}
                className={
                  confirmVariant === 'destructive'
                    ? 'bg-destructive text-white hover:bg-destructive/90'
                    : undefined
                }
              >
                {confirmLabel}
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
