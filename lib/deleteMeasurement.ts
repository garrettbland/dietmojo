import { DATABSE_NAME, TABLE_NAMES } from '@/constants'
import * as SQLite from 'expo-sqlite'
const db = SQLite.openDatabaseSync(DATABSE_NAME)

/**
 * Deletes measurement from database using expo-sqlite directly
 */
export const deleteMeasurement = async (
    id: number
): Promise<{ message: string }> => {
    try {
        await db.runAsync(
            `DELETE FROM ${TABLE_NAMES.MEASUREMENTS} WHERE id = ?`,
            [id]
        )
        return { message: 'SUCCESS' }
    } catch (error) {
        console.error('Error deleting measurement:', error)
        return {
            message:
                error instanceof Error
                    ? error.message
                    : 'Unknown error',
        }
    }
}
