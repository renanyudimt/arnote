import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { PipelineStep } from '../PipelineStep'
import { PIPELINE_LABELS } from './constants'

import type { PipelineProgressProps } from './types'

export function PipelineProgress({ steps }: PipelineProgressProps): React.JSX.Element {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{PIPELINE_LABELS.TITLE}</CardTitle>
        <CardDescription>{PIPELINE_LABELS.DESCRIPTION}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {steps.map((step) => (
            <PipelineStep
              key={step.id}
              label={step.label}
              status={step.status}
              errorMessage={step.errorMessage}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
