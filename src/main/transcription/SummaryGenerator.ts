import { net } from 'electron'

import { formatApiError } from '../lib/apiErrors'
import { createLogger } from '../lib/logger'

import type { SummaryProvider } from './SummaryProvider'

const logger = createLogger('Summary')

export interface Summary {
  title: string
  keyPoints: string[]
  actionItems: string[]
  fullSummary: string
}

export interface TranscriptEntry {
  id: string
  timestamp: number
  text: string
  speaker?: string
}

const SYSTEM_PROMPT_EN = `You are a session summarizer. Analyze the session transcript and produce a structured summary.

Return a JSON object with:
- title: A concise title for the session (max 60 chars)
- keyPoints: Array of 3-7 key points discussed
- actionItems: Array of action items identified (tasks, follow-ups, decisions)
- fullSummary: A comprehensive 2-4 paragraph summary of the session

Be concise and focus on actionable information.`

const SYSTEM_PROMPT_PT = `Você é um resumidor de sessões. Analise a transcrição da sessão e produza um resumo estruturado em português.

Retorne um objeto JSON com:
- title: Um título conciso para a sessão (máx 60 caracteres)
- keyPoints: Array de 3-7 pontos-chave discutidos
- actionItems: Array de itens de ação identificados (tarefas, acompanhamentos, decisões)
- fullSummary: Um resumo abrangente de 2-4 parágrafos da sessão

Seja conciso e foque em informações acionáveis. Tudo deve estar em português.`

const SYSTEM_PROMPTS: Record<string, string> = {
  en: SYSTEM_PROMPT_EN,
  pt: SYSTEM_PROMPT_PT,
}

export class SummaryGenerator implements SummaryProvider {
  private apiKey = ''
  private modelName = 'gpt-4o'

  configure(apiKey: string, model: string): void {
    this.apiKey = apiKey
    this.modelName = model
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey
  }

  async generate(transcript: TranscriptEntry[], language = 'pt'): Promise<Summary> {
    if (!this.apiKey) {
      throw new Error('API key not configured')
    }

    logger.info(`Generating summary for ${transcript.length} entries`)

    const transcriptText = transcript
      .map((entry) => {
        const time = new Date(entry.timestamp).toLocaleTimeString()
        const speaker = entry.speaker ? `${entry.speaker}: ` : ''
        return `[${time}] ${speaker}${entry.text}`
      })
      .join('\n')

    const body = JSON.stringify({
      model: this.modelName,
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS[language] ?? SYSTEM_PROMPTS.pt },
        { role: 'user', content: `Here is the session transcript:\n\n${transcriptText}` }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'session_summary',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              keyPoints: { type: 'array', items: { type: 'string' } },
              actionItems: { type: 'array', items: { type: 'string' } },
              fullSummary: { type: 'string' }
            },
            required: ['title', 'keyPoints', 'actionItems', 'fullSummary'],
            additionalProperties: false
          }
        }
      }
    })

    const response = await new Promise<string>((resolve, reject) => {
      const request = net.request({
        method: 'POST',
        url: 'https://api.openai.com/v1/chat/completions',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
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
    const summary = JSON.parse(content) as Summary

    logger.info(`Summary generated: "${summary.title}"`)
    return summary
  }
}
