import { Colors, Fonts, Radius } from '@/constants/theme'
import {
    addDays,
    isFuture,
    isSameDay,
    isToday,
    startOfDay,
    toDayKey,
} from '@/lib/date'
import { haptic } from '@/lib/haptics'
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { IconButton } from './ui/IconButton'

/** How many day tiles fit comfortably across a phone screen. */
const VISIBLE_DAYS = 4

/** Fixed so a border or dot appearing can never change the row height. */
const TILE_HEIGHT = 84

/** Whole days from `b` to `a` (positive when `a` is later). */
const daysBetween = (a: Date, b: Date) =>
    Math.round(
        (startOfDay(a).getTime() - startOfDay(b).getTime()) / 86400000
    )

/**
 * A short run of days with arrows either side. The arrows page the
 * window a block at a time and leave the selected day where it is —
 * only tapping a tile changes the day. The window follows the selected
 * day only when it would otherwise be off screen (picked from the
 * calendar, say). Dots mark days with meals logged.
 */
export const WeekStrip = ({
    selected,
    onSelect,
    loggedDays,
}: {
    selected: Date
    onSelect: (d: Date) => void
    loggedDays: Set<string>
}) => {
    const today = startOfDay(new Date())

    /** The last day on screen; the window runs back from here. */
    const [end, setEnd] = useState(today)
    const [seen, setSeen] = useState(() => toDayKey(selected))

    // Re-anchor when the day changes from outside the strip (the
    // calendar) and lands outside the window. Tapping a visible tile
    // leaves the window alone, so nothing shifts under the finger.
    const key = toDayKey(selected)
    if (key !== seen) {
        setSeen(key)
        const offset = daysBetween(end, selected)
        if (offset < 0 || offset > VISIBLE_DAYS - 1) {
            setEnd(startOfDay(selected))
        }
    }

    const canGoForward = daysBetween(today, end) > 0

    const page = (delta: number) => {
        const next = addDays(end, delta * VISIBLE_DAYS)
        // Never page past today
        const capped = daysBetween(next, today) > 0 ? today : next
        if (isSameDay(capped, end)) return
        haptic.selection()
        setEnd(capped)
    }

    const days = Array.from({ length: VISIBLE_DAYS }, (_, i) =>
        addDays(end, -(VISIBLE_DAYS - 1 - i))
    )

    return (
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 2,
            }}
        >
            <IconButton
                icon="chevron-back"
                accessibilityLabel="Earlier days"
                size={32}
                background="transparent"
                onPress={() => page(-1)}
            />

            <View
                style={{ flex: 1, flexDirection: 'row', gap: 8 }}
                accessibilityRole="tablist"
            >
                {days.map((d) => {
                    const active = isSameDay(d, selected)
                    const future = isFuture(d)
                    const logged = loggedDays.has(toDayKey(d))
                    const isCurrentDay = isToday(d)
                    return (
                        <Pressable
                            key={toDayKey(d)}
                            disabled={future}
                            accessibilityRole="button"
                            accessibilityState={{
                                selected: active,
                                disabled: future,
                            }}
                            accessibilityLabel={`${d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}${logged ? ', has meals' : ''}`}
                            onPress={() => {
                                haptic.selection()
                                onSelect(d)
                            }}
                            style={{
                                flex: 1,
                                height: TILE_HEIGHT,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: Radius.xl,
                                backgroundColor: active
                                    ? Colors.coral
                                    : Colors.white,
                                opacity: future ? 0.4 : 1,
                                // Always 1.5 so the box never resizes
                                borderWidth: 1.5,
                                borderColor:
                                    isCurrentDay && !active
                                        ? Colors.coral
                                        : 'transparent',
                            }}
                        >
                            <Text
                                maxFontSizeMultiplier={1.2}
                                style={{
                                    fontFamily: Fonts.bold,
                                    fontSize: 12,
                                    color: active
                                        ? 'rgba(255,255,255,0.9)'
                                        : Colors.gray500,
                                }}
                            >
                                {d
                                    .toLocaleDateString(undefined, {
                                        weekday: 'short',
                                    })
                                    .slice(0, 3)
                                    .toUpperCase()}
                            </Text>
                            <Text
                                maxFontSizeMultiplier={1.2}
                                style={{
                                    fontFamily: Fonts.extraBold,
                                    fontSize: 20,
                                    marginTop: 3,
                                    color: active
                                        ? Colors.white
                                        : Colors.text,
                                }}
                            >
                                {d.getDate()}
                            </Text>
                            <View
                                style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: 3,
                                    marginTop: 6,
                                    backgroundColor: logged
                                        ? active
                                            ? Colors.white
                                            : Colors.orange
                                        : 'transparent',
                                }}
                            />
                        </Pressable>
                    )
                })}
            </View>

            <IconButton
                icon="chevron-forward"
                accessibilityLabel="Later days"
                size={32}
                background="transparent"
                color={canGoForward ? Colors.gray700 : Colors.gray300}
                onPress={() => canGoForward && page(1)}
            />
        </View>
    )
}
