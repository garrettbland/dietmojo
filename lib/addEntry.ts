import { DATABSE_NAME, TABLE_NAMES } from '@/constants'
import { FoodEntry } from '@/types/types'
import * as SQLite from 'expo-sqlite'
const db = SQLite.openDatabaseSync(DATABSE_NAME)

/**
 * Adds an entry to database using expo-sqlite directly
 */
export const addEntry = async ({
    name,
    consumed_at,
    photo_uri,
    calories,
    protein,
    carbs,
    fat,
    category,
}: Omit<FoodEntry, 'id' | 'created_at' | 'updated_at'>): Promise<{
    message: 'SUCCESS' | 'FAILED'
    error?: string
}> => {
    try {
        console.log('Adding entry with values:', {
            name,
            consumed_at,
            photo_uri,
            calories,
            protein,
            carbs,
            fat,
            category,
        })

        const nowDate = new Date().toISOString()

        await db.runAsync(
            `INSERT INTO ${TABLE_NAMES.ENTRIES} (name, consumed_at, photo_uri, calories, protein, carbs, fat, category, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                consumed_at,
                photo_uri ?? null,
                calories ?? null,
                protein ?? null,
                carbs ?? null,
                fat ?? null,
                category ?? 'other',
                nowDate, // created_at
                nowDate, // updated_at
            ]
        )

        return { message: 'SUCCESS' }
    } catch (error) {
        console.error('Error adding entry:', error)
        return {
            message: 'FAILED',
            error:
                error instanceof Error
                    ? error.message
                    : 'Unknown error',
        }
    }
}
