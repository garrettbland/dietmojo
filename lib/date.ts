/**
 * Returns a date string in the format YYYY-MM-DD
 */
export const formatDateNoTimestamp = (date: Date): string => {
    return date.toISOString().split('T')[0]
}

/**
 * Returns a date string formatted for db
 */
export const formatDateForSQL = (date: Date): string => {
    return date.toISOString()
}
