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
        CREATE TABLE IF NOT EXISTS ${TABLE_NAMES.FOOD_ENTRIES} (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          date TEXT NOT NULL,
          photo_uri TEXT,
          notes TEXT,
          created_at INTEGER DEFAULT (strftime('%s', 'now'))
        );
        
        CREATE INDEX IF NOT EXISTS idx_food_date ON ${TABLE_NAMES.FOOD_ENTRIES}(date);
      `)
        },
    },
    {
        name: 'Add nutrition columns',
        run: async (db) => {
            await addColumnIfNotExists(
                db,
                TABLE_NAMES.FOOD_ENTRIES,
                'calories',
                'INTEGER'
            )

            await addColumnIfNotExists(
                db,
                TABLE_NAMES.FOOD_ENTRIES,
                'protein',
                'REAL'
            )

            await addColumnIfNotExists(
                db,
                TABLE_NAMES.FOOD_ENTRIES,
                'carbs',
                'REAL'
            )

            await addColumnIfNotExists(
                db,
                TABLE_NAMES.FOOD_ENTRIES,
                'fat',
                'REAL'
            )
            //       await db.execAsync(`
            //   ALTER TABLE ${TABLE_NAMES.FOOD_ENTRIES} ADD COLUMN calories INTEGER;
            //   ALTER TABLE ${TABLE_NAMES.FOOD_ENTRIES} ADD COLUMN protein REAL;
            //   ALTER TABLE ${TABLE_NAMES.FOOD_ENTRIES} ADD COLUMN carbs REAL;
            //   ALTER TABLE ${TABLE_NAMES.FOOD_ENTRIES} ADD COLUMN fat REAL;
            // `)
        },
    },
    {
        name: 'Add category',
        run: async (db) => {
            await addColumnIfNotExists(
                db,
                TABLE_NAMES.FOOD_ENTRIES,
                'category',
                "TEXT DEFAULT 'other'"
            )
        },
    },
    {
        name: 'Add user settings table',
        run: async (db) => {
            await db.execAsync(`
        CREATE TABLE IF NOT EXISTS user_settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key TEXT UNIQUE NOT NULL,
          value TEXT,
          updated_at INTEGER DEFAULT (strftime('%s', 'now'))
        );
      `)
        },
    },
    {
        name: 'Add timestamp for when user consumed',
        run: async (db) => {
            await addColumnIfNotExists(
                db,
                TABLE_NAMES.FOOD_ENTRIES,
                'consumed_at',
                'INTEGER DEFAULT (strftime("%s", "now"))'
            )
        },
    },
]
