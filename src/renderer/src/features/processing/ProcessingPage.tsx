import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import { Home } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { ProcessingNavigationState } from '@/types/session'

import { PipelineProgress } from './components'
import { useProcessingPipeline } from './hooks/useProcessingPipeline'


function ProcessingContent({
  state
}: {
  state: ProcessingNavigationState
}): React.JSX.Element {
  const navigate = useNavigate()
  const { steps, hasError } = useProcessingPipeline(state)

  return (
    <div className="flex h-screen flex-col items-center justify-center p-8">
      <PipelineProgress steps={steps} />
      {hasError && (
        <Button variant="outline" className="mt-6" onClick={() => void navigate('/')}>
          <Home className="mr-2 size-4" />
          Back to Home
        </Button>
      )}
    </div>
  )
}

export function ProcessingPage(): React.JSX.Element {
  const location = useLocation()
  const state = location.state as ProcessingNavigationState | null

  if (!state) {
    return <Navigate to="/" replace />
  }

  return <ProcessingContent state={state} />
}
