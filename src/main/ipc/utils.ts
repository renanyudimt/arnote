import type { IpcMainInvokeEvent } from 'electron'

import { IpcError } from '../lib/apiErrors'

type HandlerFn<T> = (...args: never[]) => T | Promise<T>

export function wrapHandler<T>(fn: HandlerFn<T>) {
  return async (_event: IpcMainInvokeEvent, ...args: unknown[]): Promise<T> => {
    try {
      return await (fn as (...a: unknown[]) => Promise<T>)(...args)
    } catch (error) {
      if (error instanceof Error) {
        throw new IpcError(error.message, error.name === 'Error' ? 'UNKNOWN_ERROR' : error.name)
      }
      throw new IpcError(String(error), 'UNKNOWN_ERROR')
    }
  }
}
