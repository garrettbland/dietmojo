import { Colors, Radius, Spacing } from '@/constants/theme'
import {
    addDays,
    formatDayTitle,
    formatTime,
    isToday,
    startOfDay,
} from '@/lib/date'
import { haptic } from '@/lib/haptics'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
    Keyboard,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    View,
} from 'react-native'
import { MonthCalendar } from './MonthCalendar'
import { TimeField } from './TimeField'
import { AppText } from './ui/AppText'
import { Button } from './ui/Button'
import { IconButton } from './ui/IconButton'
import { SheetHeader } from './ui/SheetHeader'

/** Put the time of `from` onto the day of `day`. */
const combine = (day: Date, from: Date) =>
    new Date(
        day.getFullYear(),
        day.getMonth(),
        day.getDate(),
        from.getHours(),
        from.getMinutes(),
        0
    )

/**
 * Day selector: arrows step a day at a time, tapping the label opens a
 * sheet with a calendar (and, with `withTime`, an hour/minute wheel in
 * its own section). Never goes past today.
 */
export const DayPicker = ({
    value,
    onChange,
    markedDays,
    label,
    withTime,
}: {
    value: Date
    onChange: (date: Date) => void
    markedDays?: Set<string>
    /** Optional caption above the control */
    label?: string
    /** Show and allow editing the time of day as well as the date */
    withTime?: boolean
}) => {
    const insets = useSafeAreaInsets()
    const [open, setOpen] = useState(false)
    // Edits inside the sheet are provisional until Done
    const [draft, setDraft] = useState(value)
    const canGoForward = !isToday(value)

    const title = withTime
        ? `${formatDayTitle(value)} · ${formatTime(value)}`
        : formatDayTitle(value)

    const shift = (delta: number) => {
        const next = addDays(value, delta)
        if (
            delta > 0 &&
            startOfDay(next).getTime() >
                startOfDay(new Date()).getTime()
        ) {
            return
        }
        haptic.selection()
        onChange(next)
    }

    const openSheet = () => {
        haptic.light()
        Keyboard.dismiss()
        setDraft(value)
        setOpen(true)
    }

    const confirm = () => {
        onChange(withTime ? draft : startOfDay(draft))
        setOpen(false)
    }

    return (
        <View style={{ gap: 8 }}>
            {label && (
                <AppText variant="label" color={Colors.gray700}>
                    {label}
                </AppText>
            )}
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: Colors.white,
                    borderRadius: Radius.lg,
                    borderWidth: 1.5,
                    borderColor: Colors.border,
                    paddingHorizontal: 4,
                    height: 50,
                }}
            >
                <IconButton
                    icon="chevron-back"
                    accessibilityLabel="Previous day"
                    size={40}
                    background="transparent"
                    onPress={() => shift(-1)}
                />

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${title}. Open picker`}
                    onPress={openSheet}
                    style={({ pressed }) => ({
                        flex: 1,
                        height: '100%',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        borderRadius: Radius.md,
                        backgroundColor: pressed
                            ? Colors.gray50
                            : 'transparent',
                    })}
                >
                    <AppText variant="bodyStrong">{title}</AppText>
                    <Ionicons
                        name="calendar-outline"
                        size={16}
                        color={Colors.coral}
                    />
                </Pressable>

                <IconButton
                    icon="chevron-forward"
                    accessibilityLabel="Next day"
                    size={40}
                    background="transparent"
                    color={
                        canGoForward ? Colors.gray700 : Colors.gray300
                    }
                    onPress={() => canGoForward && shift(1)}
                />
            </View>

            {/* Native page sheet on iOS: drags down to dismiss */}
            <Modal
                visible={open}
                animationType="slide"
                presentationStyle={
                    Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'
                }
                onRequestClose={() => setOpen(false)}
            >
                <View
                    style={{ flex: 1, backgroundColor: Colors.white }}
                >
                    {/* Same header as the meal / progress sheets */}
                    <SheetHeader
                        title={
                            withTime ? 'Date & time' : 'Pick a day'
                        }
                        onClose={() => setOpen(false)}
                    />
                    <View
                        style={{
                            height: 1,
                            backgroundColor: Colors.border,
                        }}
                    />

                    <ScrollView
                        contentContainerStyle={{
                            padding: Spacing.lg,
                            paddingBottom: Spacing.xxl,
                            gap: Spacing.lg,
                        }}
                    >
                        <View style={{ gap: 8 }}>
                            <AppText
                                variant="label"
                                color={Colors.gray500}
                            >
                                DATE
                            </AppText>
                            <MonthCalendar
                                value={draft}
                                onSelect={(d) =>
                                    setDraft(combine(d, draft))
                                }
                                markedDays={markedDays}
                            />
                        </View>

                        {withTime && (
                            <View
                                style={{
                                    gap: 8,
                                    borderTopWidth: 1,
                                    borderTopColor: Colors.border,
                                    paddingTop: Spacing.lg,
                                }}
                            >
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent:
                                            'space-between',
                                        alignItems: 'baseline',
                                    }}
                                >
                                    <AppText
                                        variant="label"
                                        color={Colors.gray500}
                                    >
                                        TIME
                                    </AppText>
                                    <AppText
                                        variant="bodyStrong"
                                        color={Colors.coral}
                                    >
                                        {formatTime(draft)}
                                    </AppText>
                                </View>
                                <TimeField
                                    value={draft}
                                    onChange={setDraft}
                                />
                            </View>
                        )}

                        <Button
                            title={withTime ? 'Now' : 'Today'}
                            variant="ghost"
                            icon="today-outline"
                            onPress={() => {
                                haptic.selection()
                                setDraft(new Date())
                            }}
                        />
                    </ScrollView>

                    {/* Fixed footer so Done is always in reach */}
                    <View
                        style={{
                            paddingHorizontal: Spacing.lg,
                            paddingTop: Spacing.sm,
                            paddingBottom: Math.max(
                                insets.bottom,
                                Spacing.md
                            ),
                            borderTopWidth: 1,
                            borderTopColor: Colors.border,
                            backgroundColor: Colors.white,
                        }}
                    >
                        <Button
                            title={
                                withTime
                                    ? `Use ${formatDayTitle(draft)} · ${formatTime(draft)}`
                                    : `Use ${formatDayTitle(draft)}`
                            }
                            icon="checkmark"
                            size="lg"
                            onPress={confirm}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    )
}
