import { TABLE_NAMES } from '@/constants'
import { FoodEntry, NewFoodEntry } from '@/types/types'
import { addDays, toDayKey, toLocalTimestamp } from './date'
import { db, Result, toError } from './db'
import { deletePhoto } from './photos'

const T = TABLE_NAMES.ENTRIES

export const getEntriesByDate = async (
    date: Date
): Promise<FoodEntry[]> =>
    db.getAllAsync<FoodEntry>(
        `SELECT * FROM ${T} WHERE substr(consumed_at, 1, 10) = ? ORDER BY consumed_at ASC, id ASC`,
        [toDayKey(date)]
    )

export const getEntryById = async (
    id: number
): Promise<FoodEntry | null> =>
    db.getFirstAsync<FoodEntry>(`SELECT * FROM ${T} WHERE id = ?`, [
        id,
    ])

export const addEntry = async (
    entry: NewFoodEntry
): Promise<Result<number>> => {
    try {
        const now = toLocalTimestamp(new Date())
        const res = await db.runAsync(
            `INSERT INTO ${T} (name, consumed_at, photo_uri, notes, calories, protein, carbs, fat, fiber, category, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                entry.name,
                entry.consumed_at,
                entry.photo_uri,
                entry.notes,
                entry.calories,
                entry.protein,
                entry.carbs,
                entry.fat,
                entry.fiber,
                entry.category ?? 'other',
                now,
                now,
            ]
        )
        return { ok: true, data: res.lastInsertRowId }
    } catch (error) {
        console.error('Error adding entry:', error)
        return { ok: false, error: toError(error) }
    }
}

export const updateEntry = async (
    id: number,
    entry: NewFoodEntry
): Promise<Result> => {
    try {
        await db.runAsync(
            `UPDATE ${T} SET name = ?, consumed_at = ?, photo_uri = ?, notes = ?, calories = ?, protein = ?, carbs = ?, fat = ?, fiber = ?, category = ?, updated_at = ? WHERE id = ?`,
            [
                entry.name,
                entry.consumed_at,
                entry.photo_uri,
                entry.notes,
                entry.calories,
                entry.protein,
                entry.carbs,
                entry.fat,
                entry.fiber,
                entry.category ?? 'other',
                toLocalTimestamp(new Date()),
                id,
            ]
        )
        return { ok: true, data: undefined }
    } catch (error) {
        console.error('Error updating entry:', error)
        return { ok: false, error: toError(error) }
    }
}

/**
 * Deletes the entry. Pass keepPhoto when offering "Undo" and call
 * deletePhoto() yourself once the undo window has passed.
 */
export const deleteEntry = async (
    entry: FoodEntry,
    { keepPhoto = false }: { keepPhoto?: boolean } = {}
): Promise<Result> => {
    try {
        await db.runAsync(`DELETE FROM ${T} WHERE id = ?`, [entry.id])
        if (!keepPhoto) deletePhoto(entry.photo_uri)
        return { ok: true, data: undefined }
    } catch (error) {
        console.error('Error deleting entry:', error)
        return { ok: false, error: toError(error) }
    }
}

/** Re-insert a deleted entry (used by "Undo"). Photo must still exist. */
export const restoreEntry = async (entry: FoodEntry) =>
    db.runAsync(
        `INSERT INTO ${T} (id, name, consumed_at, photo_uri, notes, calories, protein, carbs, fat, fiber, category, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            entry.id,
            entry.name,
            entry.consumed_at,
            entry.photo_uri,
            entry.notes,
            entry.calories,
            entry.protein,
            entry.carbs,
            entry.fat,
            entry.fiber,
            entry.category,
            entry.created_at,
            entry.updated_at,
        ]
    )

/** Day keys ("YYYY-MM-DD") that have at least one entry in a range. */
export const getLoggedDays = async (
    from: Date,
    to: Date
): Promise<Set<string>> => {
    const rows = await db.getAllAsync<{ day: string }>(
        `SELECT DISTINCT substr(consumed_at, 1, 10) AS day FROM ${T}
         WHERE substr(consumed_at, 1, 10) BETWEEN ? AND ?`,
        [toDayKey(from), toDayKey(to)]
    )
    return new Set(rows.map((r) => r.day))
}

/**
 * Current logging streak: consecutive days with at least one entry,
 * ending today (or yesterday, if nothing is logged yet today).
 */
export const getStreak = async (): Promise<{
    current: number
    loggedToday: boolean
}> => {
    const rows = await db.getAllAsync<{ day: string }>(
        `SELECT DISTINCT substr(consumed_at, 1, 10) AS day FROM ${T}
         ORDER BY day DESC LIMIT 400`
    )
    const days = new Set(rows.map((r) => r.day))
    const today = new Date()
    const loggedToday = days.has(toDayKey(today))

    let cursor = loggedToday ? today : addDays(today, -1)
    let current = 0
    while (days.has(toDayKey(cursor))) {
        current++
        cursor = addDays(cursor, -1)
    }
    return { current, loggedToday }
}

export const getAllEntries = async () =>
    db.getAllAsync<FoodEntry>(
        `SELECT * FROM ${T} ORDER BY consumed_at ASC`
    )

export const countEntries = async () =>
    (
        await db.getFirstAsync<{ count: number }>(
            `SELECT COUNT(*) AS count FROM ${T}`
        )
    )?.count ?? 0
