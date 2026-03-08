import { Download } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { BUTTON_LABEL } from './constants'
import { useSessionExport } from '../../hooks/useSessionExport'

import type { DownloadButtonProps } from './types'

export function DownloadButton({ sessionId }: DownloadButtonProps): React.JSX.Element {
  const { exportSession } = useSessionExport()

  const handleExport = async (): Promise<void> => {
    try {
      const filePath = await exportSession(sessionId)
      if (filePath) {
        console.log('Exported to:', filePath)
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="size-4" />
      {BUTTON_LABEL}
    </Button>
  )
}
