import { TABLE_NAMES } from '@/constants'
import { File, Paths } from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { toDayKey } from './date'
import { db } from './db'
import { getAllEntries } from './entries'
import { getAllMeasurements } from './measurements'
import { deleteAllPhotos } from './photos'
import { getSettings } from './settings'
import { fromKg } from './units'

const csvCell = (value: unknown) => {
    if (value == null) return ''
    const s = String(value)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

const toCsv = (rows: unknown[][]) =>
    rows.map((r) => r.map(csvCell).join(',')).join('\n')

const writeTemp = (name: string, content: string) => {
    const file = new File(Paths.cache, name)
    file.create({ overwrite: true })
    file.write(content)
    return file
}

/**
 * Export meals + measurements as CSV files and open the share sheet.
 * Photos are not included.
 */
export const exportData = async () => {
    const [entries, measurements] = await Promise.all([
        getAllEntries(),
        getAllMeasurements(),
    ])
    const unit = getSettings().weightUnit
    const stamp = toDayKey(new Date())

    const mealsCsv = toCsv([
        [
            'date',
            'time',
            'name',
            'category',
            'calories',
            'protein_g',
            'carbs_g',
            'fat_g',
            'fiber_g',
            'notes',
        ],
        ...entries.map((e) => [
            e.consumed_at.slice(0, 10),
            e.consumed_at.slice(11, 16),
            e.name,
            e.category,
            e.calories,
            e.protein,
            e.carbs,
            e.fat,
            e.fiber,
            e.notes,
        ]),
    ])

    const measurementsCsv = toCsv([
        ['date', 'type', `value (${unit} for weight)`],
        ...measurements.map((m) => [
            m.measured_at.slice(0, 10),
            m.type,
            m.type === 'WEIGHT'
                ? fromKg(m.value, unit).toFixed(1)
                : m.value,
        ]),
    ])

    const meals = writeTemp(`dietmojo-meals-${stamp}.csv`, mealsCsv)
    const weights = writeTemp(
        `dietmojo-measurements-${stamp}.csv`,
        measurementsCsv
    )

    if (!(await Sharing.isAvailableAsync())) {
        throw new Error('Sharing is not available on this device')
    }

    await Sharing.shareAsync(meals.uri, {
        mimeType: 'text/csv',
        UTI: 'public.comma-separated-values-text',
        dialogTitle: 'Export meals',
    })
    if (measurements.length) {
        await Sharing.shareAsync(weights.uri, {
            mimeType: 'text/csv',
            UTI: 'public.comma-separated-values-text',
            dialogTitle: 'Export measurements',
        })
    }
}

/** Delete every meal, measurement and photo. Keeps schema + settings. */
export const eraseAllData = async () => {
    await db.execAsync(`
        DELETE FROM ${TABLE_NAMES.ENTRIES};
        DELETE FROM ${TABLE_NAMES.MEASUREMENTS};
    `)
    deleteAllPhotos()
}
