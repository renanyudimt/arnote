// Common Whisper hallucinations when receiving silence or near-silence
export const HALLUCINATION_PATTERNS: RegExp[] = [
  /^thanks?\s*(you)?\s*(for)?\s*(watching|listening)/i,
  /^(please\s+)?(like\s+and\s+)?subscribe/i,
  /^see\s+you\s+(in\s+the\s+)?next/i,
  /^(bye|goodbye)\s*\.?$/i,
  /^\[.*\]$/,
  /^♪.*♪$/,
  /^\.+$/,
]
