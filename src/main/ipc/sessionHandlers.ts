import { ipcMain } from 'electron'

import { IPC } from './constants'

import type { SessionStore, StoredSession } from '../storage'


export function registerSessionHandlers(sessionStore: SessionStore): void {
  ipcMain.handle(IPC.SESSION_LIST, () => sessionStore.list())

  ipcMain.handle(IPC.SESSION_GET, (_event, id: string) => sessionStore.get(id))

  ipcMain.handle(IPC.SESSION_SAVE, (_event, session: StoredSession) => sessionStore.save(session))

  ipcMain.handle(IPC.SESSION_DELETE, (_event, id: string) => {
    sessionStore.delete(id)
    return true
  })

  ipcMain.handle(
    IPC.SESSION_EXPORT_MD,
    async (_event, id: string) => await sessionStore.exportMarkdown(id)
  )
}
