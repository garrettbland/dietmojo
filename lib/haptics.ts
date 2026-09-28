import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'

const enabled = Platform.OS === 'ios' || Platform.OS === 'android'
const safe = (fn: () => Promise<void>) => {
    if (!enabled) return
    fn().catch(() => {})
}

/** Small wrapper so haptics never throw and are no-ops on web. */
export const haptic = {
    light: () =>
        safe(() =>
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        ),
    medium: () =>
        safe(() =>
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        ),
    selection: () => safe(() => Haptics.selectionAsync()),
    success: () =>
        safe(() =>
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
            )
        ),
    warning: () =>
        safe(() =>
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Warning
            )
        ),
}
