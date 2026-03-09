# Transcript Curation Middleware

## Problem Statement

Arnote transcribes audio using ASR engines (Whisper, Realtime API). Raw transcriptions often contain errors that degrade summary quality:

| Error Type | Example |
|---|---|
| **Hallucinated words** | Silence transcribed as "Thank you for watching" or "Obrigado" |
| **Wrong language fragments** | PT-BR meeting gets random English or Spanish words |
| **Chunk boundary repetitions** | Last sentence of chunk N repeated at start of chunk N+1 |
| **Filler words** | Excessive "né", "tipo", "like", "you know" |
| **Misrecognized proper nouns** | "React" → "Reacts", "Kubernetes" → "Cubernets" |

These errors compound in the summarizer, producing inaccurate or nonsensical summaries.

## Solution: The Pragmatist Approach

A single LLM call per session that combines multiple correction strategies:

1. **Few-shot examples** — Concrete before/after pairs of common ASR errors in PT-BR and EN
2. **Language rules** — Enforce primary language while preserving an allowlist of English tech terms
3. **User-configurable glossary** — Domain-specific terms the model must preserve exactly
4. **Deterministic output** — Temperature 0.0 to avoid creative rewrites

### Why a Single Pass?

- Simpler to implement and debug than multi-stage pipelines
- One API call keeps latency and cost low
- `gpt-4o-mini` handles all correction types well in a single prompt
- Easy to swap for Ollama models without architectural changes

## Pipeline Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Transcription   │────▶│  Curation Layer  │────▶│   Summarizer    │
│  (Whisper/RT)    │     │  (LLM cleanup)   │     │  (LLM summary)  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                              │
                              ├── Few-shot examples
                              ├── Language constraints
                              └── Glossary injection
```

When curation is **disabled**, the pipeline skips directly from Transcription to Summarizer (existing behavior).

## Prompt Strategy

The system prompt instructs the model to:

1. **Fix ASR artifacts** — Remove hallucinated phrases, fix repeated segments
2. **Enforce language** — Keep the transcript in the primary language, preserving technical English terms from an allowlist
3. **Apply glossary** — Replace misrecognized variants of glossary terms with the correct spelling
4. **Preserve meaning** — Never add, remove, or rephrase content beyond corrections
5. **Return JSON** — Output `{ entries: [...] }` matching the input structure

### Few-Shot Examples (PT-BR)

```
Input:  "Então vamos usar o Reacts para o front end, né, tipo, obrigado."
Output: "Então vamos usar o React para o front-end."

Input:  "O Cubernets vai rodar no cluster. Thank you for watching."
Output: "O Kubernetes vai rodar no cluster."
```

## Configuration

| Setting | Type | Default | Description |
|---|---|---|---|
| `curationEnabled` | boolean | `false` | Enable/disable the curation step |
| `curationProvider` | `'openai' \| 'ollama'` | `'openai'` | Which LLM provider to use |
| `curationModel` | string | `'gpt-4o-mini'` | OpenAI model name |
| `ollamaCurationModel` | string | `''` | Ollama model name |
| `curationGlossary` | string[] | `[]` | Domain terms to preserve exactly |

## Cost Analysis

Using `gpt-4o-mini` (as of 2024):

- **Input**: ~$0.15 / 1M tokens
- **Output**: ~$0.60 / 1M tokens
- **Typical 30-min meeting**: ~3,000 words ≈ 4,000 tokens → ~$0.003

The curation step adds negligible cost compared to the transcription itself.

## Future Improvements

- **Sliding window**: For very long sessions (>2h), process transcript in overlapping windows to stay within context limits
- **Feedback loop**: Allow users to flag remaining errors post-curation, feeding corrections back into the glossary
- **Language auto-detection**: Automatically detect the primary language instead of requiring manual selection
- **Confidence scores**: Tag low-confidence corrections so users can review them
