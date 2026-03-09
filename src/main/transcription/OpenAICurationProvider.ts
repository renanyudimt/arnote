import { net } from 'electron'

import { CURATION_SYSTEM_PROMPTS, buildGlossaryInstruction, buildUserMessage } from './curation-prompts'
import { formatApiError } from '../lib/apiErrors'
import { createLogger } from '../lib/logger'

import type { CurationProvider } from './CurationProvider'
import type { TranscriptEntry } from './SummaryGenerator'

const logger = createLogger('Curation')

export class OpenAICurationProvider implements CurationProvider {
  private apiKey = ''
  private modelName = 'gpt-4o-mini'

  configure(apiKey: string, model: string): void {
    this.apiKey = apiKey
    this.modelName = model
  }

  async curate(
    transcript: TranscriptEntry[],
    language = 'pt',
    glossary: string[] = []
  ): Promise<TranscriptEntry[]> {
    if (!this.apiKey) {
      throw new Error('API key not configured')
    }

    if (transcript.length === 0) {
      return []
    }

    logger.info(`Curating ${transcript.length} entries using model: ${this.modelName}`)

    const transcriptText = JSON.stringify(
      transcript.map((entry) => ({
        id: entry.id,
        timestamp: entry.timestamp,
        text: entry.text,
        speaker: entry.speaker,
      }))
    )

    const systemPrompt =
      (CURATION_SYSTEM_PROMPTS[language] ?? CURATION_SYSTEM_PROMPTS.pt) +
      buildGlossaryInstruction(glossary)

    const body = JSON.stringify({
      model: this.modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: buildUserMessage(transcriptText) },
      ],
      temperature: 0.0,
      response_format: { type: 'json_object' },
    })

    const response = await new Promise<string>((resolve, reject) => {
      const request = net.request({
        method: 'POST',
        url: 'https://api.openai.com/v1/chat/completions',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      })

      let responseData = ''

      request.on('response', (res) => {
        res.on('data', (chunk: Buffer) => {
          responseData += chunk.toString()
        })

        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(responseData)
          } else {
            reject(new Error(formatApiError(res.statusCode, responseData)))
          }
        })
      })

      request.on('error', reject)
      request.write(body)
      request.end()
    })

    const parsed = JSON.parse(response) as {
      choices: Array<{ message: { content: string } }>
    }
    const content = parsed.choices[0].message.content
    const result = JSON.parse(content) as { entries: TranscriptEntry[] }

    logger.info(`Curation complete: ${result.entries.length} entries`)
    return result.entries
  }
}
