export const STEP_IDS = {
  CURATION: 'curation',
  SUMMARY: 'summary',
  SAVING: 'saving'
} as const

export const STEP_LABELS: Record<string, string> = {
  [STEP_IDS.CURATION]: 'Curating transcript',
  [STEP_IDS.SUMMARY]: 'Generating summary',
  [STEP_IDS.SAVING]: 'Saving session'
}
