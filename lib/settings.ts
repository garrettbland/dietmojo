import Storage from 'expo-sqlite/kv-store'
import { useSyncExternalStore } from 'react'
import { WeightUnit } from './units'

/**
 * User settings, persisted with expo-sqlite's key-value store.
 * Read with useSettings(), write with updateSettings().
 */
/** The four trackable nutrients */
export type Nutrient =
    'calories' | 'protein' | 'carbs' | 'fat' | 'fiber'

export const NUTRIENTS: {
    key: Nutrient
    label: string
    short: string
    suffix: string
}[] = [
    {
        key: 'calories',
        label: 'Calories',
        short: 'Cal',
        suffix: 'kcal',
    },
    { key: 'protein', label: 'Protein', short: 'P', suffix: 'g' },
    { key: 'carbs', label: 'Carbs', short: 'C', suffix: 'g' },
    { key: 'fat', label: 'Fat', short: 'F', suffix: 'g' },
    { key: 'fiber', label: 'Fiber', short: 'Fb', suffix: 'g' },
]

export type Settings = {
    goals: Record<Nutrient, number>
    /**
     * Which nutrients the home screen shows progress for. Logging is
     * unaffected — every nutrient can always be entered on a meal.
     */
    show: Record<Nutrient, boolean>
    /** Which extra cards the home screen shows */
    cards: {
        streak: boolean
        weight: boolean
    }
    weightUnit: WeightUnit
    /**
     * Master switch for nutrition. When off, the meal form drops the
     * nutrition fields and home shows no nutrient progress — but the
     * per-nutrient picks in `show` are remembered for when it's back on.
     */
    trackNutrition: boolean
    /** Which side the main action buttons sit on */
    handedness: 'right' | 'left'
    listStyle: 'comfortable' | 'compact'
    reminders: {
        enabled: boolean
        /** "HH:mm" 24h times */
        times: string[]
    }
}

export const DEFAULT_SETTINGS: Settings = {
    goals: {
        calories: 2000,
        protein: 150,
        carbs: 200,
        fat: 65,
        fiber: 30,
    },
    show: {
        calories: false,
        protein: true,
        carbs: false,
        fat: false,
        fiber: false,
    },
    cards: { streak: true, weight: true },
    weightUnit: 'lb',
    trackNutrition: true,
    handedness: 'right',
    listStyle: 'comfortable',
    reminders: {
        enabled: false,
        times: ['08:30', '12:30', '18:30'],
    },
}

const KEY = 'settings:v1'

const load = (): Settings => {
    try {
        const raw = Storage.getItemSync(KEY)
        if (!raw) return DEFAULT_SETTINGS
        const parsed = JSON.parse(raw) as Partial<Settings> & {
            /** Renamed to trackNutrition (inverted) */
            hideNutrition?: boolean
        }
        const trackNutrition =
            parsed.trackNutrition ??
            (parsed.hideNutrition === undefined
                ? undefined
                : !parsed.hideNutrition)
        return {
            ...DEFAULT_SETTINGS,
            ...parsed,
            goals: { ...DEFAULT_SETTINGS.goals, ...parsed.goals },
            show: { ...DEFAULT_SETTINGS.show, ...parsed.show },
            cards: { ...DEFAULT_SETTINGS.cards, ...parsed.cards },
            trackNutrition:
                trackNutrition ?? DEFAULT_SETTINGS.trackNutrition,
            reminders: {
                ...DEFAULT_SETTINGS.reminders,
                ...parsed.reminders,
            },
        }
    } catch {
        return DEFAULT_SETTINGS
    }
}

let current: Settings | null = null
const listeners = new Set<() => void>()

export const getSettings = (): Settings => {
    if (!current) current = load()
    return current
}

export const updateSettings = (
    patch: Partial<Settings> | ((prev: Settings) => Partial<Settings>)
) => {
    const prev = getSettings()
    const changes = typeof patch === 'function' ? patch(prev) : patch
    current = { ...prev, ...changes }
    try {
        Storage.setItemSync(KEY, JSON.stringify(current))
    } catch (error) {
        console.warn('Could not save settings', error)
    }
    listeners.forEach((l) => l())
}

export const resetSettings = () => {
    try {
        Storage.removeItemSync(KEY)
    } catch {}
    current = DEFAULT_SETTINGS
    listeners.forEach((l) => l())
}

const subscribe = (listener: () => void) => {
    listeners.add(listener)
    return () => {
        listeners.delete(listener)
    }
}

export const useSettings = () =>
    useSyncExternalStore(subscribe, getSettings, getSettings)
