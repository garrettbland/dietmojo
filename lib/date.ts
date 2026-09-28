/**
 * Date helpers.
 *
 * Everything is stored in the user's LOCAL time, as
 * "YYYY-MM-DDTHH:mm:ss" (no timezone suffix). The first 10 characters
 * are the local day key ("YYYY-MM-DD"), which is what we query on.
 *
 * Previously dates were stored with toISOString() (UTC), which put
 * evening meals on the next day for anyone west of UTC.
 */

const pad = (n: number) => String(n).padStart(2, '0')

/** Local day key, e.g. "2026-09-16" */
export const toDayKey = (date: Date): string =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

/** Local timestamp, e.g. "2026-09-16T18:42:05" */
export const toLocalTimestamp = (date: Date): string =>
    `${toDayKey(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`

/** Parse "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss" as a local date */
export const parseLocal = (value: string): Date => {
    const [d, t = '12:00:00'] = value.replace('Z', '').split('T')
    const [y, m, day] = d.split('-').map(Number)
    const [hh = 0, mm = 0, ss = 0] = t
        .split('.')[0]
        .split(':')
        .map(Number)
    return new Date(y, m - 1, day, hh, mm, ss)
}

/** Kept for backwards compatibility with older call sites */
export const formatDateNoTimestamp = toDayKey
export const formatDateForSQL = toLocalTimestamp

/**
 * Returns a timestamp on the selected day using the current time of day.
 * Used when logging food for the day being viewed.
 */
export const onDayAtCurrentTime = (day: Date): Date => {
    const now = new Date()
    return new Date(
        day.getFullYear(),
        day.getMonth(),
        day.getDate(),
        now.getHours(),
        now.getMinutes(),
        now.getSeconds()
    )
}

export const startOfDay = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate())

export const addDays = (date: Date, days: number) => {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    return d
}

export const isSameDay = (a: Date, b: Date) =>
    toDayKey(a) === toDayKey(b)

export const isToday = (date: Date) => isSameDay(date, new Date())

export const isFuture = (date: Date) =>
    startOfDay(date).getTime() > startOfDay(new Date()).getTime()

/** "Today", "Yesterday", "Tomorrow" or "Monday, Sep 14" */
export const formatDayTitle = (date: Date): string => {
    const today = new Date()
    if (isSameDay(date, today)) return 'Today'
    if (isSameDay(date, addDays(today, -1))) return 'Yesterday'
    if (isSameDay(date, addDays(today, 1))) return 'Tomorrow'
    return date.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
    })
}

/**
 * Compact header label: "Today", "Yesterday", "Tomorrow" or "Sep 10".
 * Kept short so it never crowds the buttons beside it.
 */
export const formatDayShort = (date: Date): string => {
    const today = new Date()
    if (isSameDay(date, today)) return 'Today'
    if (isSameDay(date, addDays(today, -1))) return 'Yesterday'
    if (isSameDay(date, addDays(today, 1))) return 'Tomorrow'
    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
    })
}

export const formatLongDate = (date: Date): string =>
    date.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    })

export const formatTime = (date: Date): string =>
    date.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
    })
