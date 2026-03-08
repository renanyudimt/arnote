import { writeFile } from 'fs/promises'
import { join } from 'path'

import { app } from 'electron'

import Store from 'electron-store'

export interface StoredSession {
  id: string
  createdAt: string
  endedAt: string | null
  title: string
  transcript: Array<{
    id: string
    timestamp: number
    text: string
    speaker?: string
  }>
  summary: {
    title: string
    keyPoints: string[]
    actionItems: string[]
    fullSummary: string
  } | null
  status: 'recording' | 'summarizing' | 'completed'
  filePath: string | null
}

interface StoreSchema {
  sessions: StoredSession[]
}

export class SessionStore {
  private store: Store<StoreSchema>

  constructor() {
    this.store = new Store<StoreSchema>({
      name: 'sessions',
      defaults: {
        sessions: []
      }
    })
  }

  list(): StoredSession[] {
    return this.store.get('sessions')
  }

  get(id: string): StoredSession | undefined {
    const sessions = this.store.get('sessions')
    return sessions.find((s) => s.id === id)
  }

  save(session: StoredSession): StoredSession {
    const sessions = this.store.get('sessions')
    const index = sessions.findIndex((s) => s.id === session.id)

    if (index >= 0) {
      sessions[index] = session
    } else {
      sessions.unshift(session)
    }

    this.store.set('sessions', sessions)
    return session
  }

  delete(id: string): void {
    const sessions = this.store.get('sessions')
    this.store.set(
      'sessions',
      sessions.filter((s) => s.id !== id)
    )
  }

  async exportMarkdown(id: string): Promise<string | null> {
    const session = this.get(id)
    if (!session) return null

    const documentsPath = app.getPath('documents')
    const fileName = `arnote-${session.title.replace(/[^a-zA-Z0-9]/g, '-')}-${session.id.slice(0, 8)}.md`
    const filePath = join(documentsPath, fileName)

    let md = `# ${session.title}\n\n`
    md += `**Date:** ${new Date(session.createdAt).toLocaleString()}\n\n`

    if (session.summary) {
      md += `## Summary\n\n${session.summary.fullSummary}\n\n`
      md += `## Key Points\n\n`
      session.summary.keyPoints.forEach((point) => {
        md += `- ${point}\n`
      })
      md += `\n## Action Items\n\n`
      session.summary.actionItems.forEach((item) => {
        md += `- [ ] ${item}\n`
      })
      md += '\n'
    }

    md += `## Transcript\n\n`
    session.transcript.forEach((entry) => {
      const time = new Date(entry.timestamp).toLocaleTimeString()
      const speaker = entry.speaker ? `**${entry.speaker}:** ` : ''
      md += `[${time}] ${speaker}${entry.text}\n\n`
    })

    await writeFile(filePath, md, 'utf-8')

    // Update session with file path
    session.filePath = filePath
    this.save(session)

    return filePath
  }
}
