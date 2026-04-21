import { DATABSE_NAME, TABLE_NAMES } from '@/constants'
import { FoodEntry } from '@/types/types'
import * as SQLite from 'expo-sqlite'
const db = SQLite.openDatabaseSync(DATABSE_NAME)

/**
 * Updates a food entry in the database using expo-sqlite directly
 */
export const updateFoodEntry = async ({
    id,
    name,
    consumed_at,
    photo_uri,
    calories,
    protein,
    carbs,
    fat,
    category,
}: Omit<FoodEntry, 'created_at' | 'updated_at'>): Promise<{
    message: 'SUCCESS' | 'FAILED'
    error?: string
}> => {
    try {
        console.log('Updating food entry with values:', {
            id,
            name,
            consumed_at,
            photo_uri,
            calories,
            protein,
            carbs,
            fat,
            category,
        })

        await db.runAsync(
            `UPDATE ${TABLE_NAMES.ENTRIES} SET name = ?, consumed_at = ?, photo_uri = ?, calories = ?, protein = ?, carbs = ?, fat = ?, category = ?, updated_at = ? WHERE id = ?`,
            [
                name,
                consumed_at,
                photo_uri ?? null,
                calories ?? null,
                protein ?? null,
                carbs ?? null,
                fat ?? null,
                category ?? 'other',
                new Date().toISOString(),
                id,
            ]
        )

        return { message: 'SUCCESS' }
    } catch (error) {
        console.error('Error updating food entry:', error)
        return {
            message: 'FAILED',
            error:
                error instanceof Error
                    ? error.message
                    : 'Unknown error',
        }
    }
}
