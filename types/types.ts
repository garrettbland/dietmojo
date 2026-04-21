/**
 * Type used for food entries in the app. This should match the schema defined in the database migrations.
 */
export type FoodEntry = {
    id: number
    name: string
    photo_uri: string | null
    notes: string | null
    consumed_at: string // YYYY-MM-DD
    calories: number | null
    protein: number | null
    carbs: number | null
    fat: number | null
    category: string | null
    created_at: string // YYYY-MM-DD
    updated_at: string // YYYY-MM-DD (automatically updated with sqlite trigger)
}

/**
 * Measurements entry type, used for tracking weight or other progress metrics. This is currently unused but can be implemented in the future.
 * TO DO: How does apple health store this?
 */
export type MeasurementEntry = {
    id: number
    measured_at: string // YYYY-MM-DD
    type: 'WEIGHT' | 'WAIST' | 'ABDOMEN' | 'HIPS' | 'PHOTO' // This can be expanded in the future as needed
    value: number | string
    created_at: string // YYYY-MM-DD
    updated_at: string // YYYY-MM-DD (automatically updated with sqlite trigger)
}

/**
 * Type used for user settings. This can be expanded in the future as needed. Stored locally using expo-secure-store or similar.
 */
export type Settings = {
    theme: 'light' | 'dark' | 'system'
}
