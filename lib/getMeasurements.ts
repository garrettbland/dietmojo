import { DATABSE_NAME, TABLE_NAMES } from '@/constants'
import { MeasurementEntry } from '@/types/types'
import * as SQLite from 'expo-sqlite'
import { formatDateNoTimestamp } from './date'

const db = SQLite.openDatabaseSync(DATABSE_NAME)

/**
 * Retrieves measurements for a specific date
 */
export const getMeasurementsByDate = async (
    date: Date // eg 2026-03-11T12:54:19.353Z
): Promise<MeasurementEntry[]> => {
    try {
        // Format date as YYYY-MM-DD for consistent comparison
        const dateString = formatDateNoTimestamp(date) // eg "2026-03-11"

        console.log('Loading record for date:', dateString)

        const entries = await db.getAllAsync<MeasurementEntry>(
            `SELECT * FROM ${TABLE_NAMES.MEASUREMENTS} WHERE date(measured_at) = ? ORDER BY measured_at ASC`,
            [dateString]
        )

        return entries
    } catch (error) {
        console.error('Error fetching measurements:', error)
        throw error
    }
}
