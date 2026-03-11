import * as SQLite from 'expo-sqlite'
import { DATABSE_NAME, TABLE_NAMES } from './constants'

const db = SQLite.openDatabaseSync(DATABSE_NAME)

/**
 * Adds a food entry to database using expo-sqlite directly
 */
export const addFoodEntry = async ({
    photoUri,
    name,
    calories,
    protein,
    carbs,
    fat,
    category,
}: {
    photoUri?: string
    name: string
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
    category?: string
}): Promise<{ message: 'SUCCESS' | 'FAILED'; error?: string }> => {
    try {
        const today = new Date().toISOString().split('T')[0]

        await db.runAsync(
            `INSERT INTO ${TABLE_NAMES.FOOD_ENTRIES} (name, date, photo_uri, calories, protein, carbs, fat, category)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                today,
                photoUri ?? null,
                calories ?? null,
                protein ?? null,
                carbs ?? null,
                fat ?? null,
                category ?? 'other',
            ]
        )

        return { message: 'SUCCESS' }
    } catch (error) {
        console.error('Error adding food entry:', error)
        return {
            message: 'FAILED',
            error:
                error instanceof Error
                    ? error.message
                    : 'Unknown error',
        }
    }
}
