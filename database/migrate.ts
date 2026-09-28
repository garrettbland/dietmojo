import { SQLiteDatabase } from 'expo-sqlite'
import { migrations } from './migrations'

export const migrateDbIfNeeded = async (db: SQLiteDatabase) => {
    // Increment this for each migration
    const TOTAL_MIGRATIONS = migrations.length

    await db.execAsync('PRAGMA journal_mode = WAL')

    console.log(
        `ℹ️ Latest required migration version: ${TOTAL_MIGRATIONS}`
    )

    /**
     * Have to use user_version to track the users current migration version.
     */
    const row = await db.getFirstAsync<{ user_version: number }>(
        'PRAGMA user_version'
    )
    const USERS_CURRENT_MIGRATION = row?.user_version ?? 0

    console.log(
        `📊 Current database migration version: ${USERS_CURRENT_MIGRATION}/${TOTAL_MIGRATIONS}`
    )

    if (USERS_CURRENT_MIGRATION >= TOTAL_MIGRATIONS) {
        console.log(
            `✅ No migration needed, user has latest migration changes`
        )
        return
    }

    console.log(
        `🔄 Running ${TOTAL_MIGRATIONS - USERS_CURRENT_MIGRATION} migration(s)...`
    )

    for (let i = USERS_CURRENT_MIGRATION; i < TOTAL_MIGRATIONS; i++) {
        const migration = migrations[i]
        console.log(`  ${i + 1}. ${migration.name}...`)

        try {
            await db.execAsync('BEGIN TRANSACTION')
            await migration.run(db)
            await db.execAsync(`PRAGMA user_version = ${i + 1}`)
            await db.execAsync('COMMIT')

            console.log(`  ✅ ${migration.name} completed`)
        } catch (error) {
            await db.execAsync('ROLLBACK')
            console.error(`  ❌ ${migration.name} failed:`, error)
            throw new Error(
                `Migration ${i} (${migration.name}) failed: ${error instanceof Error ? error.message : String(error)}`
            )
        }
    }

    console.log(
        `✅ Users migrations updated to version ${TOTAL_MIGRATIONS}`
    )
}
