import type { StepStatus } from '../PipelineStep/types'

export interface PipelineStepState {
  id: string
  label: string
  status: StepStatus
  errorMessage?: string
}

export interface PipelineProgressProps {
  steps: PipelineStepState[]
}
