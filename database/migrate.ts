import { SQLiteDatabase } from 'expo-sqlite'
import { migrations } from './migrations'

export const migrateDbIfNeeded = async (db: SQLiteDatabase) => {
    // Increment this for each migration
    const TOTAL_MIGRATIONS = migrations.length

    console.log(
        `ℹ️ Latest required migration version: ${TOTAL_MIGRATIONS}`
    )

    /**
     * Have to use user_version to track the users current migration version.
     */
    let { user_version: USERS_CURRENT_MIGRATION } =
        await db.getFirstAsync('PRAGMA user_version')

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
                `Migration ${i} (${migration.name}) failed: ${error.message}`
            )
        }
    }

    console.log(
        `✅ Users migrations updated to version ${TOTAL_MIGRATIONS}`
    )
}
