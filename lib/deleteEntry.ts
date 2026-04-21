import { DATABSE_NAME, TABLE_NAMES } from '@/constants'
import * as SQLite from 'expo-sqlite'
const db = SQLite.openDatabaseSync(DATABSE_NAME)

/**
 * Deletes food item from database using expo-sqlite directly
 */
export const deleteFoodItem = async (
    id: number
): Promise<{ message: string }> => {
    try {
        await db.runAsync(
            `DELETE FROM ${TABLE_NAMES.ENTRIES} WHERE id = ?`,
            [id]
        )
        return { message: 'SUCCESS' }
    } catch (error) {
        console.error('Error deleting food entry:', error)
        return {
            message:
                error instanceof Error
                    ? error.message
                    : 'Unknown error',
        }
    }
}
