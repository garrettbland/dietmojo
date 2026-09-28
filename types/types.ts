/**
 * Food entry row. Matches the schema in database/migrations.ts.
 * Timestamps are local time: "YYYY-MM-DDTHH:mm:ss".
 */
export type FoodEntry = {
    id: number
    name: string
    /** Relative path ("photos/meal_x.jpg"); use resolvePhotoUri() */
    photo_uri: string | null
    notes: string | null
    consumed_at: string
    calories: number | null
    protein: number | null
    carbs: number | null
    fat: number | null
    fiber: number | null
    category: string | null
    created_at: string
    updated_at: string
}

export type NewFoodEntry = Omit<
    FoodEntry,
    'id' | 'created_at' | 'updated_at'
>

export type MeasurementType =
    'WEIGHT' | 'WAIST' | 'ABDOMEN' | 'HIPS' | 'PHOTO'

/**
 * Measurement row. WEIGHT values are stored in kilograms.
 */
export type MeasurementEntry = {
    id: number
    measured_at: string
    type: MeasurementType
    value: number
    created_at: string
    updated_at: string
}

/**
 * Form state for the add/edit food screens. Numbers are kept as
 * strings while typing so "1." and "" behave naturally.
 */
export type FoodInputsType = {
    foodName: string
    calories: string
    protein: string
    carbs: string
    fat: string
    fiber: string
    notes: string
    category: string
}
