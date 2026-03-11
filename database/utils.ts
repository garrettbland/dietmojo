import { SQLiteDatabase } from 'expo-sqlite'

/**
 * Checks if the column exists or not before trying to add. SQLite doesn't support
 * if the column exists.
 *
 * Example usage...
 * ```js
 * addColumnIfNotExists(db, TABLE_NAMES.FOOD_ENTRIES, "calories", "INTEGER");
 * ```
 */
export const addColumnIfNotExists = async (
    db: SQLiteDatabase,
    table: string,
    column: string,
    definition: string
) => {
    const columns = await db.getAllAsync<{ name: string }>(
        `PRAGMA table_info(${table})`
    )
    const exists = columns.some((c) => c.name === column)
    if (!exists) {
        await db.execAsync(
            `ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`
        )
    }
}
