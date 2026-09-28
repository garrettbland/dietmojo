export type WeightUnit = 'lb' | 'kg'

const KG_PER_LB = 0.45359237

export const toKg = (value: number, unit: WeightUnit) =>
    unit === 'kg' ? value : value * KG_PER_LB

export const fromKg = (kg: number, unit: WeightUnit) =>
    unit === 'kg' ? kg : kg / KG_PER_LB

export const formatWeight = (kg: number, unit: WeightUnit) =>
    `${fromKg(kg, unit).toFixed(1)} ${unit}`

/** Parse a user-typed number; accepts "1,5" as 1.5. Empty → null. */
export const parseNumber = (text: string): number | null => {
    const cleaned = text.replace(',', '.').trim()
    if (cleaned === '') return null
    const n = Number(cleaned)
    return Number.isFinite(n) && n >= 0 ? n : null
}

/** Only allow digits and one decimal separator while typing. */
export const sanitizeDecimal = (text: string) => {
    const cleaned = text.replace(/[^0-9.,]/g, '').replace(',', '.')
    const [whole, ...rest] = cleaned.split('.')
    return rest.length ? `${whole}.${rest.join('')}` : whole
}

export const formatNumber = (n: number | null | undefined) => {
    if (n == null || !Number.isFinite(n)) return '0'
    return Number.isInteger(n) ? String(n) : n.toFixed(1)
}
