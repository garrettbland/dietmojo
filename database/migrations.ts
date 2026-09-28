import { TABLE_NAMES } from '@/constants'
import { SQLiteDatabase } from 'expo-sqlite'
import { addColumnIfNotExists } from './utils'

export type Migration = {
    name: string
    run: (db: SQLiteDatabase) => Promise<void>
}

export const migrations: Migration[] = [
    {
        name: 'Initial schema',
        run: async (db) => {
            await db.execAsync(`
        CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.ENTRIES} (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          photo_uri TEXT,
          notes TEXT,
          consumed_at TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        
        CREATE INDEX IF NOT EXISTS idx_food_consumed_at ON ${TABLE_NAMES.ENTRIES}(consumed_at);
      `)
        },
    },
    // {
    //     name: 'Add updated at trigger',
    //     run: async (db) => {
    //         await db.execAsync(`
    //             CREATE TRIGGER IF NOT EXISTS automatic_updated_at
    //             AFTER UPDATE ON ${TABLE_NAMES.ENTRIES}
    //             FOR EACH ROW
    //             BEGIN
    //                 UPDATE ${TABLE_NAMES.ENTRIES} SET updated_at = date('now') WHERE id = OLD.id;
    //             END;
    //             `)
    //     },
    // },
    {
        name: 'Add nutrition columns',
        run: async (db) => {
            await addColumnIfNotExists(
                db,
                TABLE_NAMES.ENTRIES,
                'calories',
                'INTEGER'
            )

            await addColumnIfNotExists(
                db,
                TABLE_NAMES.ENTRIES,
                'protein',
                'REAL'
            )

            await addColumnIfNotExists(
                db,
                TABLE_NAMES.ENTRIES,
                'carbs',
                'REAL'
            )

            await addColumnIfNotExists(
                db,
                TABLE_NAMES.ENTRIES,
                'fat',
                'REAL'
            )
            //       await db.execAsync(`
            //   ALTER TABLE ${TABLE_NAMES.ENTRIES} ADD COLUMN calories INTEGER;
            //   ALTER TABLE ${TABLE_NAMES.ENTRIES} ADD COLUMN protein REAL;
            //   ALTER TABLE ${TABLE_NAMES.ENTRIES} ADD COLUMN carbs REAL;
            //   ALTER TABLE ${TABLE_NAMES.ENTRIES} ADD COLUMN fat REAL;
            // `)
        },
    },
    {
        name: 'Add category',
        run: async (db) => {
            await addColumnIfNotExists(
                db,
                TABLE_NAMES.ENTRIES,
                'category',
                "TEXT DEFAULT 'other'"
            )
        },
    },
    {
        name: 'Add measurements table',
        run: async (db) => {
            await db.execAsync(`
                CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.MEASUREMENTS} (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    measured_at TEXT NOT NULL,
                    type TEXT NOT NULL,
                    value TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );

                CREATE INDEX IF NOT EXISTS idx_measured_at ON ${TABLE_NAMES.MEASUREMENTS}(measured_at);
            `)
        },
    },
    // {
    //     name: 'Add updated at trigger for measurements',
    //     run: async (db) => {
    //         await db.execAsync(`
    //             CREATE TRIGGER IF NOT EXISTS automatic_updated_at
    //             AFTER UPDATE ON ${TABLE_NAMES.MEASUREMENTS}
    //             FOR EACH ROW
    //             BEGIN
    //                 UPDATE ${TABLE_NAMES.MEASUREMENTS} SET updated_at = date('now') WHERE id = OLD.id;
    //             END;
    //             `)
    //     },
    // },
    {
        /**
         * Timestamps used to be saved with toISOString() (UTC, "...Z").
         * Convert them to local time so queries by day are correct.
         * Runs on-device, so 'localtime' uses the phone's timezone.
         */
        name: 'Convert UTC timestamps to local time',
        run: async (db) => {
            const fmt = `'%Y-%m-%dT%H:%M:%S'`
            await db.execAsync(`
                UPDATE ${TABLE_NAMES.ENTRIES}
                SET consumed_at = strftime(${fmt}, consumed_at, 'localtime')
                WHERE consumed_at LIKE '%Z';

                UPDATE ${TABLE_NAMES.ENTRIES}
                SET created_at = strftime(${fmt}, created_at, 'localtime')
                WHERE created_at LIKE '%Z';

                UPDATE ${TABLE_NAMES.ENTRIES}
                SET updated_at = strftime(${fmt}, updated_at, 'localtime')
                WHERE updated_at LIKE '%Z';

                UPDATE ${TABLE_NAMES.MEASUREMENTS}
                SET measured_at = strftime(${fmt}, measured_at, 'localtime')
                WHERE measured_at LIKE '%Z';

                UPDATE ${TABLE_NAMES.MEASUREMENTS}
                SET created_at = strftime(${fmt}, created_at, 'localtime')
                WHERE created_at LIKE '%Z';

                UPDATE ${TABLE_NAMES.MEASUREMENTS}
                SET updated_at = strftime(${fmt}, updated_at, 'localtime')
                WHERE updated_at LIKE '%Z';

                UPDATE ${TABLE_NAMES.ENTRIES}
                SET category = 'other'
                WHERE category IS NULL;

                CREATE INDEX IF NOT EXISTS idx_measurements_type_date
                ON ${TABLE_NAMES.MEASUREMENTS}(type, measured_at);
            `)
        },
    },
    /**
     * This doesn't need to be in the sqlite databsae, it can be local storage.
     */
    // {
    //     name: 'Add user settings table',
    //     run: async (db) => {
    //         await db.execAsync(`
    //     CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.USER_SETTINGS} (
    //       id INTEGER PRIMARY KEY AUTOINCREMENT,
    //       key TEXT UNIQUE NOT NULL,
    //       value TEXT,
    //       updated_at TEXT DEFAULT (date('now'))
    //     );
    //   `)
    //     },
    // },
    {
        name: 'Add fiber column',
        run: async (db) => {
            await addColumnIfNotExists(
                db,
                TABLE_NAMES.ENTRIES,
                'fiber',
                'REAL'
            )
        },
    },
]
