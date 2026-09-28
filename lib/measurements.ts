import { TABLE_NAMES } from '@/constants'
import { MeasurementEntry, MeasurementType } from '@/types/types'
import { toDayKey, toLocalTimestamp } from './date'
import { db, Result, toError } from './db'

const T = TABLE_NAMES.MEASUREMENTS

type Row = Omit<MeasurementEntry, 'value'> & { value: string }

const parse = (row: Row): MeasurementEntry => ({
    ...row,
    value: Number(row.value),
})

/**
 * Weight is stored in kilograms; convert for display with lib/units.
 */
export const addMeasurement = async ({
    measured_at,
    type,
    value,
}: {
    measured_at: string
    type: MeasurementType
    value: number
}): Promise<Result> => {
    try {
        const now = toLocalTimestamp(new Date())
        await db.runAsync(
            `INSERT INTO ${T} (measured_at, type, value, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?)`,
            [measured_at, type, String(value), now, now]
        )
        return { ok: true, data: undefined }
    } catch (error) {
        console.error('Error adding measurement:', error)
        return { ok: false, error: toError(error) }
    }
}

/**
 * Save one weight per day: replaces any existing entry for that day.
 */
export const upsertDailyMeasurement = async (args: {
    measured_at: string
    type: MeasurementType
    value: number
}): Promise<Result> => {
    try {
        await db.runAsync(
            `DELETE FROM ${T} WHERE type = ? AND substr(measured_at, 1, 10) = ?`,
            [args.type, args.measured_at.slice(0, 10)]
        )
    } catch (error) {
        return { ok: false, error: toError(error) }
    }
    return addMeasurement(args)
}

export const deleteMeasurement = async (
    id: number
): Promise<Result> => {
    try {
        await db.runAsync(`DELETE FROM ${T} WHERE id = ?`, [id])
        return { ok: true, data: undefined }
    } catch (error) {
        console.error('Error deleting measurement:', error)
        return { ok: false, error: toError(error) }
    }
}

export const getMeasurementForDay = async (
    type: MeasurementType,
    date: Date
): Promise<MeasurementEntry | null> => {
    const row = await db.getFirstAsync<Row>(
        `SELECT * FROM ${T} WHERE type = ? AND substr(measured_at, 1, 10) = ?
         ORDER BY measured_at DESC LIMIT 1`,
        [type, toDayKey(date)]
    )
    return row ? parse(row) : null
}

/** All measurements of a type since `from` (or all time), oldest first. */
export const getMeasurements = async (
    type: MeasurementType,
    from?: Date
): Promise<MeasurementEntry[]> => {
    const rows = from
        ? await db.getAllAsync<Row>(
              `SELECT * FROM ${T} WHERE type = ? AND substr(measured_at, 1, 10) >= ?
               ORDER BY measured_at ASC`,
              [type, toDayKey(from)]
          )
        : await db.getAllAsync<Row>(
              `SELECT * FROM ${T} WHERE type = ? ORDER BY measured_at ASC`,
              [type]
          )
    return rows.map(parse).filter((m) => Number.isFinite(m.value))
}

export const getAllMeasurements = async () =>
    (
        await db.getAllAsync<Row>(
            `SELECT * FROM ${T} ORDER BY measured_at ASC`
        )
    ).map(parse)
