import { AppText } from '@/components/ui/AppText'
import { Card } from '@/components/ui/Card'
import { Segmented } from '@/components/ui/Chip'
import { IconButton } from '@/components/ui/IconButton'
import { SheetHeader } from '@/components/ui/SheetHeader'
import { TextField } from '@/components/ui/TextField'
import { Colors, Spacing } from '@/constants/theme'
import { eraseAllData, exportData } from '@/lib/dataTools'
import { countEntries } from '@/lib/entries'
import { haptic } from '@/lib/haptics'
import { posthogLogger } from '@/lib/posthogLogs'
import {
    cancelReminders,
    formatReminderTime,
    requestReminderPermission,
    scheduleReminders,
} from '@/lib/notifications'
import {
    getSettings,
    Nutrient,
    NUTRIENTS,
    Settings,
    updateSettings,
    useSettings,
} from '@/lib/settings'
import { parseNumber, sanitizeDecimal } from '@/lib/units'
import Ionicons from '@expo/vector-icons/Ionicons'
import Constants from 'expo-constants'
import { useRouter } from 'expo-router'
import { usePostHog } from 'posthog-react-native'
import { ComponentProps, ReactNode, useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Linking,
    Platform,
    Pressable,
    ScrollView,
    Switch,
    View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const Section = ({
    title,
    footer,
    children,
}: {
    title: string
    footer?: string
    children: ReactNode
}) => (
    <View style={{ gap: 8 }}>
        <AppText
            variant="label"
            color={Colors.gray500}
            style={{ marginLeft: 4 }}
        >
            {title.toUpperCase()}
        </AppText>
        <Card padding={0}>{children}</Card>
        {footer && (
            <AppText
                variant="caption"
                color={Colors.gray500}
                style={{ marginHorizontal: 4 }}
            >
                {footer}
            </AppText>
        )}
    </View>
)

const Row = ({
    icon,
    iconColor = Colors.orange,
    label,
    detail,
    right,
    onPress,
    destructive,
    first,
    busy,
}: {
    icon: ComponentProps<typeof Ionicons>['name']
    iconColor?: string
    label: string
    detail?: string
    right?: ReactNode
    onPress?: () => void
    destructive?: boolean
    first?: boolean
    busy?: boolean
}) => (
    <Pressable
        disabled={!onPress || busy}
        onPress={onPress}
        accessibilityRole={onPress ? 'button' : undefined}
        style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingHorizontal: 16,
            minHeight: 56,
            paddingVertical: 10,
            borderTopWidth: first ? 0 : 1,
            borderTopColor: Colors.border,
            backgroundColor: pressed ? Colors.gray50 : 'transparent',
        })}
    >
        <View
            style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                backgroundColor: destructive
                    ? '#FDECEC'
                    : Colors.orangeTint,
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Ionicons
                name={icon}
                size={18}
                color={destructive ? Colors.danger : iconColor}
            />
        </View>
        <View style={{ flex: 1 }}>
            <AppText
                variant="bodyStrong"
                color={destructive ? Colors.danger : Colors.text}
            >
                {label}
            </AppText>
            {detail && (
                <AppText variant="caption" color={Colors.gray500}>
                    {detail}
                </AppText>
            )}
        </View>
        {busy ? (
            <ActivityIndicator color={Colors.coral} />
        ) : (
            (right ??
            (onPress && (
                <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={Colors.gray300}
                />
            )))
        )}
    </Pressable>
)

const shiftTime = (time: string, minutes: number) => {
    const [h, m] = time.split(':').map(Number)
    const total = (((h * 60 + m + minutes) % 1440) + 1440) % 1440
    const hh = String(Math.floor(total / 60)).padStart(2, '0')
    const mm = String(total % 60).padStart(2, '0')
    return `${hh}:${mm}`
}

const SettingsScreen = () => {
    const router = useRouter()
    const posthog = usePostHog()
    const insets = useSafeAreaInsets()
    const settings = useSettings()
    const [goalText, setGoalText] = useState(() =>
        Object.fromEntries(
            NUTRIENTS.map((n) => [
                n.key,
                String(settings.goals[n.key]),
            ])
        )
    )
    const shownNutrients = NUTRIENTS.filter(
        (n) => settings.show[n.key]
    )
    const [count, setCount] = useState<number | null>(null)
    const [exporting, setExporting] = useState(false)

    useEffect(() => {
        countEntries().then(setCount)
    }, [])

    const commitGoal = (key: Nutrient) => {
        const n = parseNumber(goalText[key] ?? '')
        if (n == null || n <= 0) {
            setGoalText((p) => ({
                ...p,
                [key]: String(settings.goals[key]),
            }))
            return
        }
        updateSettings((prev) => ({
            goals: { ...prev.goals, [key]: Math.round(n) },
        }))
    }

    const setReminders = async (
        patch: Partial<Settings['reminders']>
    ) => {
        // Read the latest value so quick repeated taps don't clobber
        const next = { ...getSettings().reminders, ...patch }
        updateSettings({ reminders: next })

        if (!next.enabled) {
            await cancelReminders()
            return
        }
        const granted = await requestReminderPermission()
        if (!granted) {
            updateSettings({ reminders: { ...next, enabled: false } })
            Alert.alert(
                'Notifications are off',
                'Turn on notifications for Diet Mojo in Settings to get reminders.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Open Settings',
                        onPress: () => Linking.openSettings(),
                    },
                ]
            )
            return
        }
        await scheduleReminders(getSettings().reminders.times)
    }

    const doExport = async () => {
        setExporting(true)
        try {
            await exportData()
            posthog.capture('data_exported')
            posthogLogger.info('local data export completed', {
                export_format: 'csv',
            })
        } catch (error) {
            Alert.alert(
                'Export failed',
                error instanceof Error
                    ? error.message
                    : 'Please try again.'
            )
        } finally {
            setExporting(false)
        }
    }

    const confirmErase = () => {
        Alert.alert(
            'Erase all data?',
            'This permanently deletes every meal, photo and weigh-in on this phone. This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Erase everything',
                    style: 'destructive',
                    onPress: async () => {
                        await eraseAllData()
                        posthog.capture('data_erased')
                        haptic.success()
                        setCount(0)
                        Alert.alert('Done', 'All data was erased.')
                    },
                },
            ]
        )
    }

    const version = Constants.expoConfig?.version ?? '1.0.0'

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: Colors.background }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <SheetHeader title="Settings" />
            <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                    padding: Spacing.lg,
                    paddingTop: Spacing.xs,
                    gap: Spacing.xl,
                    paddingBottom: insets.bottom + 40,
                }}
            >
                <Section
                    title="Track on home"
                    footer={
                        settings.trackNutrition
                            ? 'Pick what the home screen shows progress for. Every nutrient can still be logged on a meal — this only changes what is displayed.'
                            : 'Nutrition is off: no nutrition fields on the meal form and no nutrient progress on home. Your picks are remembered for when you turn it back on.'
                    }
                >
                    <Row
                        first
                        icon="nutrition-outline"
                        label="Track nutrition"
                        detail={
                            settings.trackNutrition
                                ? 'Calories and macros on meals and home'
                                : 'Photos, names and notes only'
                        }
                        right={
                            <Switch
                                value={settings.trackNutrition}
                                onValueChange={(trackNutrition) =>
                                    updateSettings({ trackNutrition })
                                }
                                trackColor={{
                                    true: Colors.coral,
                                    false: Colors.gray100,
                                }}
                                accessibilityLabel="Track nutrition"
                            />
                        }
                    />
                    {settings.trackNutrition &&
                        NUTRIENTS.map((n) => (
                            <Row
                                key={n.key}
                                icon="stats-chart-outline"
                                label={n.label}
                                detail={
                                    settings.show[n.key]
                                        ? `Goal ${settings.goals[n.key]}${n.suffix === 'g' ? 'g' : ' kcal'}`
                                        : 'Hidden on home'
                                }
                                right={
                                    <Switch
                                        value={settings.show[n.key]}
                                        onValueChange={(on) =>
                                            updateSettings(
                                                (prev) => ({
                                                    show: {
                                                        ...prev.show,
                                                        [n.key]: on,
                                                    },
                                                })
                                            )
                                        }
                                        trackColor={{
                                            true: Colors.coral,
                                            false: Colors.gray100,
                                        }}
                                        accessibilityLabel={`Show ${n.label} on home`}
                                    />
                                }
                            />
                        ))}
                    {(
                        [
                            {
                                key: 'streak',
                                label: 'Streak',
                                icon: 'flame-outline',
                                detail: 'Days logged in a row',
                            },
                            {
                                key: 'weight',
                                label: 'Weight',
                                icon: 'scale-outline',
                                detail: 'Latest weigh-in for the day',
                            },
                        ] as const
                    ).map((c) => (
                        <Row
                            key={c.key}
                            icon={c.icon}
                            label={c.label}
                            detail={
                                settings.cards[c.key]
                                    ? c.detail
                                    : 'Hidden on home'
                            }
                            right={
                                <Switch
                                    value={settings.cards[c.key]}
                                    onValueChange={(on) =>
                                        updateSettings((prev) => ({
                                            cards: {
                                                ...prev.cards,
                                                [c.key]: on,
                                            },
                                        }))
                                    }
                                    trackColor={{
                                        true: Colors.coral,
                                        false: Colors.gray100,
                                    }}
                                    accessibilityLabel={`Show ${c.label} on home`}
                                />
                            }
                        />
                    ))}
                </Section>

                {settings.trackNutrition &&
                    shownNutrients.length > 0 && (
                        <Section
                            title="Daily goals"
                            footer="Targets for the nutrients shown above."
                        >
                            <View
                                style={{
                                    padding: 16,
                                    flexDirection: 'row',
                                    flexWrap: 'wrap',
                                    gap: Spacing.sm,
                                }}
                            >
                                {shownNutrients.map((n) => (
                                    <View
                                        key={n.key}
                                        style={{
                                            width: '47%',
                                            flexGrow: 1,
                                        }}
                                    >
                                        <TextField
                                            label={n.label}
                                            suffix={n.suffix}
                                            keyboardType="number-pad"
                                            value={goalText[n.key]}
                                            onChangeText={(t) =>
                                                setGoalText((p) => ({
                                                    ...p,
                                                    [n.key]:
                                                        sanitizeDecimal(
                                                            t
                                                        ),
                                                }))
                                            }
                                            onBlur={() =>
                                                commitGoal(n.key)
                                            }
                                            selectTextOnFocus
                                            maxLength={5}
                                        />
                                    </View>
                                ))}
                            </View>
                        </Section>
                    )}

                <Section title="Preferences">
                    <View style={{ padding: 16, gap: 14 }}>
                        <View style={{ gap: 8 }}>
                            <AppText
                                variant="label"
                                color={Colors.gray700}
                            >
                                Weight unit
                            </AppText>
                            <Segmented
                                options={[
                                    {
                                        key: 'lb',
                                        label: 'Pounds (lb)',
                                    },
                                    {
                                        key: 'kg',
                                        label: 'Kilograms (kg)',
                                    },
                                ]}
                                value={settings.weightUnit}
                                onChange={(weightUnit) =>
                                    updateSettings({ weightUnit })
                                }
                            />
                        </View>
                        <View style={{ gap: 8 }}>
                            <AppText
                                variant="label"
                                color={Colors.gray700}
                            >
                                Meal list
                            </AppText>
                            <Segmented
                                options={[
                                    {
                                        key: 'comfortable',
                                        label: 'Comfortable',
                                    },
                                    {
                                        key: 'compact',
                                        label: 'Compact',
                                    },
                                ]}
                                value={settings.listStyle}
                                onChange={(listStyle) =>
                                    updateSettings({ listStyle })
                                }
                            />
                        </View>
                        <View style={{ gap: 8 }}>
                            <AppText
                                variant="label"
                                color={Colors.gray700}
                            >
                                Add meal button
                            </AppText>
                            <Segmented
                                options={[
                                    {
                                        key: 'left',
                                        label: 'Left hand',
                                    },
                                    {
                                        key: 'right',
                                        label: 'Right hand',
                                    },
                                ]}
                                value={settings.handedness}
                                onChange={(handedness) =>
                                    updateSettings({ handedness })
                                }
                            />
                        </View>
                    </View>
                </Section>

                <Section
                    title="Reminders"
                    footer="Daily nudges to log your meals."
                >
                    <Row
                        first
                        icon="notifications"
                        label="Meal reminders"
                        right={
                            <Switch
                                value={settings.reminders.enabled}
                                onValueChange={(enabled) =>
                                    setReminders({ enabled })
                                }
                                trackColor={{
                                    true: Colors.coral,
                                    false: Colors.gray100,
                                }}
                                accessibilityLabel="Meal reminders"
                            />
                        }
                    />
                    {settings.reminders.enabled &&
                        settings.reminders.times.map((time, i) => (
                            <Row
                                key={i}
                                icon="time-outline"
                                label={formatReminderTime(time)}
                                detail={
                                    ['Breakfast', 'Lunch', 'Dinner'][
                                        i
                                    ] ?? 'Reminder'
                                }
                                right={
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            gap: 6,
                                        }}
                                    >
                                        {[-30, 30].map((delta) => (
                                            <IconButton
                                                key={delta}
                                                icon={
                                                    delta < 0
                                                        ? 'remove'
                                                        : 'add'
                                                }
                                                accessibilityLabel={`${delta < 0 ? 'Earlier' : 'Later'} by 30 minutes`}
                                                size={34}
                                                background={
                                                    Colors.gray50
                                                }
                                                onPress={() => {
                                                    const times = [
                                                        ...getSettings()
                                                            .reminders
                                                            .times,
                                                    ]
                                                    times[i] =
                                                        shiftTime(
                                                            times[i],
                                                            delta
                                                        )
                                                    setReminders({
                                                        times,
                                                    })
                                                }}
                                            />
                                        ))}
                                    </View>
                                }
                            />
                        ))}
                </Section>

                <Section
                    title="Your data"
                    footer="Everything is stored only on this phone."
                >
                    <Row
                        first
                        icon="share-outline"
                        label="Export data"
                        detail={
                            count == null
                                ? 'CSV of meals and weigh-ins'
                                : `${count} meals · CSV`
                        }
                        onPress={doExport}
                        busy={exporting}
                    />
                    <Row
                        icon="trash-outline"
                        label="Erase all data"
                        detail="Meals, photos and weigh-ins"
                        destructive
                        onPress={confirmErase}
                    />
                </Section>

                {__DEV__ && (
                    <Section title="Developer">
                        <Row
                            first
                            icon="server-outline"
                            label="Explore database"
                            onPress={() => router.push('/database')}
                        />
                    </Section>
                )}

                <AppText
                    variant="caption"
                    color={Colors.gray500}
                    align="center"
                >
                    Diet Mojo {version}
                    {'\n'}Your food, your mood, your mojo.
                </AppText>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

export default SettingsScreen
