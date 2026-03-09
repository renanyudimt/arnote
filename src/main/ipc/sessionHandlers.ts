import { ipcMain } from 'electron'

import { IPC } from './constants'
import { wrapHandler } from './utils'

import type { SessionStore, StoredSession } from '../storage'


export function registerSessionHandlers(sessionStore: SessionStore): void {
  ipcMain.handle(IPC.SESSION_LIST, wrapHandler(() => sessionStore.list()))

  ipcMain.handle(IPC.SESSION_GET, wrapHandler((id: string) => sessionStore.get(id)))

  ipcMain.handle(IPC.SESSION_SAVE, wrapHandler((session: StoredSession) => sessionStore.save(session)))

  ipcMain.handle(IPC.SESSION_DELETE, wrapHandler((id: string) => {
    sessionStore.delete(id)
    return true
  }))

  ipcMain.handle(
    IPC.SESSION_EXPORT_MD,
    wrapHandler(async (id: string) => await sessionStore.exportMarkdown(id))
  )
}
