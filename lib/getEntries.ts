import { DATABSE_NAME, TABLE_NAMES } from '@/constants'
import { FoodEntry } from '@/types/types'
import * as SQLite from 'expo-sqlite'
import { formatDateNoTimestamp } from './date'

const db = SQLite.openDatabaseSync(DATABSE_NAME)

/**
 * Retrieves food entries for a specific date
 */
export const getEntriesByDate = async (
    date: Date // eg 2026-03-11T12:54:19.353Z
): Promise<FoodEntry[]> => {
    try {
        // Format date as YYYY-MM-DD for consistent comparison
        const dateString = formatDateNoTimestamp(date) // eg "2026-03-11"

        console.log('Loading entries for date:', dateString)

        const entries = await db.getAllAsync<FoodEntry>(
            `SELECT * FROM ${TABLE_NAMES.ENTRIES} WHERE date(consumed_at) = ? ORDER BY consumed_at ASC`,
            [dateString]
        )

        return entries
    } catch (error) {
        console.error('Error fetching entries:', error)
        throw error
    }
}
