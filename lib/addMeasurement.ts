import { DATABSE_NAME, TABLE_NAMES } from '@/constants'
import { MeasurementEntry } from '@/types/types'
import * as SQLite from 'expo-sqlite'
const db = SQLite.openDatabaseSync(DATABSE_NAME)

/**
 * Add Measurement entry
 */
export const addMeasurement = async ({
    measured_at,
    type,
    value,
}: Omit<
    MeasurementEntry,
    'id' | 'created_at' | 'updated_at'
>): Promise<{
    message: 'SUCCESS' | 'FAILED'
    error?: string
}> => {
    try {
        console.log('Adding measurement entry with values:', {
            measured_at,
            type,
            value,
        })

        const nowDate = new Date().toISOString()

        /**
         * TO DO: Change this to "type" and then the value can be "weight", "waist", "abdomen", "hips" etc. Then we can have a single table for all progress entries and just filter by type when displaying. This will make it more flexible and easier to add new types of progress entries in the future without needing to alter the database schema.
         */
        await db.runAsync(
            `INSERT INTO ${TABLE_NAMES.MEASUREMENTS} (measured_at, type, value, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?)`,
            [
                measured_at, // time
                type,
                value,
                nowDate, // created_at
                nowDate, // updated_at
            ]
        )

        return { message: 'SUCCESS' }
    } catch (error) {
        console.error('Error adding measurement entry:', error)
        return {
            message: 'FAILED',
            error:
                error instanceof Error
                    ? error.message
                    : 'Unknown error',
        }
    }
}
