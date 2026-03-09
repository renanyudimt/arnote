export type StepStatus = 'pending' | 'active' | 'completed' | 'error'

export interface PipelineStepProps {
  label: string
  status: StepStatus
  errorMessage?: string
}
