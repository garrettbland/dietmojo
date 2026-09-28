import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

const MESSAGES = [
    { title: 'Mojo check 🍳', body: 'Snap a photo of breakfast?' },
    {
        title: 'Lunch time 🥗',
        body: "Log what you're eating — it takes 5 seconds.",
    },
    {
        title: 'Dinner check-in 🍝',
        body: 'Keep the streak alive. Log dinner.',
    },
    { title: 'Quick log 📸', body: 'Anything to add to today?' },
]

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
})

// PermissionResponse comes from a nested expo-modules-core package whose
// types don't always resolve, so describe the fields we use.
type PermissionState = { granted: boolean; canAskAgain: boolean }

export const requestReminderPermission =
    async (): Promise<boolean> => {
        const existing =
            (await Notifications.getPermissionsAsync()) as unknown as PermissionState
        if (existing.granted) return true
        if (!existing.canAskAgain) return false
        const res =
            (await Notifications.requestPermissionsAsync()) as unknown as PermissionState
        return res.granted
    }

/** Replace all scheduled reminders with daily ones at the given times. */
export const scheduleReminders = async (times: string[]) => {
    await Notifications.cancelAllScheduledNotificationsAsync()

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('reminders', {
            name: 'Meal reminders',
            importance: Notifications.AndroidImportance.DEFAULT,
        })
    }

    for (const [i, time] of times.entries()) {
        const [hour, minute] = time.split(':').map(Number)
        if (!Number.isFinite(hour) || !Number.isFinite(minute))
            continue
        const msg = MESSAGES[i % MESSAGES.length]
        await Notifications.scheduleNotificationAsync({
            content: { title: msg.title, body: msg.body },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes
                    .DAILY,
                hour,
                minute,
                channelId: 'reminders',
            },
        })
    }
}

export const cancelReminders = () =>
    Notifications.cancelAllScheduledNotificationsAsync()

export const formatReminderTime = (time: string) => {
    const [h, m] = time.split(':').map(Number)
    const d = new Date()
    d.setHours(h, m, 0, 0)
    return d.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
    })
}
