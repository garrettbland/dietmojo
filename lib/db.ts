import { DATABASE_NAME } from '@/constants'
import * as SQLite from 'expo-sqlite'

/**
 * Single shared connection used by all data helpers in /lib.
 * (Previously every helper file opened its own connection.)
 *
 * SQLiteProvider in app/_layout.tsx runs migrations before any screen
 * renders, so queries made from screens always see the latest schema.
 */
export const db = SQLite.openDatabaseSync(DATABASE_NAME)

export type Result<T = undefined> =
    { ok: true; data: T } | { ok: false; error: string }

export const toError = (error: unknown) =>
    error instanceof Error ? error.message : 'Unknown error'
