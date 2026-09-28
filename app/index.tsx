import { DailySummary } from '@/components/DailySummary'
import { FoodCard } from '@/components/FoodCard'
import { AppText } from '@/components/ui/AppText'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { IconButton } from '@/components/ui/IconButton'
import { Toast } from '@/components/ui/Toast'
import { WeekStrip } from '@/components/WeekStrip'
import { Colors, Spacing } from '@/constants/theme'
import {
    addDays,
    formatDayShort,
    formatLongDate,
    isToday,
} from '@/lib/date'
import {
    deleteEntry,
    getEntriesByDate,
    getLoggedDays,
    getStreak,
    restoreEntry,
} from '@/lib/entries'
import { haptic } from '@/lib/haptics'
import { getMeasurementForDay } from '@/lib/measurements'
import { deletePhoto } from '@/lib/photos'
import { useSettings } from '@/lib/settings'
import { formatWeight } from '@/lib/units'
import { useDate } from '@/providers/DateProvider'
import { FoodEntry, MeasurementEntry } from '@/types/types'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View,
} from 'react-native'
import Animated, {
    FadeIn,
    LinearTransition,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const UNDO_MS = 4000

const Home = () => {
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const settings = useSettings()
    const { date, setDate } = useDate()

    const [entries, setEntries] = useState<FoodEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [streak, setStreak] = useState({
        current: 0,
        loggedToday: false,
    })
    const [weight, setWeight] = useState<MeasurementEntry | null>(
        null
    )
    const [loggedDays, setLoggedDays] = useState<Set<string>>(
        new Set()
    )
    const [undo, setUndo] = useState<FoodEntry | null>(null)
    const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(
        null
    )
    const requestId = useRef(0)

    const load = useCallback(async () => {
        const id = ++requestId.current
        try {
            const [dayEntries, s, w, days] = await Promise.all([
                getEntriesByDate(date),
                getStreak(),
                getMeasurementForDay('WEIGHT', date),
                // Wide enough that paging the strip back never runs
                // out of dots before the data does
                getLoggedDays(addDays(date, -120), addDays(date, 7)),
            ])
            // Ignore stale responses when flipping days quickly
            if (id !== requestId.current) return
            setEntries(dayEntries)
            setStreak(s)
            setWeight(w)
            setLoggedDays(days)
        } catch (error) {
            console.error('Failed to load day', error)
        } finally {
            if (id === requestId.current) setLoading(false)
        }
    }, [date])

    // Reload whenever the screen regains focus or the day changes
    useFocusEffect(
        useCallback(() => {
            load()
        }, [load])
    )

    // Finish any pending delete when leaving the screen
    useEffect(
        () => () => {
            if (undoTimer.current) clearTimeout(undoTimer.current)
        },
        []
    )

    const onRefresh = async () => {
        setRefreshing(true)
        await load()
        setRefreshing(false)
    }

    const handleDelete = async (entry: FoodEntry) => {
        haptic.warning()
        // Flush previous pending delete
        if (undo) deletePhoto(undo.photo_uri)
        if (undoTimer.current) clearTimeout(undoTimer.current)

        setEntries((prev) => prev.filter((e) => e.id !== entry.id))
        const res = await deleteEntry(entry, { keepPhoto: true })
        if (!res.ok) {
            load()
            return
        }
        setUndo(entry)
        undoTimer.current = setTimeout(() => {
            deletePhoto(entry.photo_uri)
            setUndo(null)
            load()
        }, UNDO_MS)
    }

    const handleUndo = async () => {
        if (!undo) return
        if (undoTimer.current) clearTimeout(undoTimer.current)
        await restoreEntry(undo)
        setUndo(null)
        haptic.success()
        load()
    }

    const leftHanded = settings.handedness === 'left'
    const viewingToday = isToday(date)
    const bottomBarHeight = 64 + insets.bottom

    return (
        <View style={{ flex: 1, backgroundColor: Colors.background }}>
            <ScrollView
                contentContainerStyle={{
                    paddingTop: insets.top + Spacing.xs,
                    paddingHorizontal: Spacing.md,
                    paddingBottom: bottomBarHeight + 40,
                    gap: Spacing.md,
                }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={Colors.coral}
                    />
                }
            >
                {/* Header */}
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`${formatLongDate(date)}. Open calendar`}
                        onPress={() => {
                            haptic.light()
                            router.push('/calendar')
                        }}
                        style={{ flex: 1, paddingVertical: 4 }}
                    >
                        {({ pressed }) => (
                            <View
                                style={{
                                    // Content-sized so the press scales
                                    // around the date, not the whole row
                                    alignSelf: 'flex-start',
                                    transform: [
                                        { scale: pressed ? 0.97 : 1 },
                                    ],
                                }}
                            >
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 4,
                                    }}
                                >
                                    <AppText
                                        variant="h1"
                                        numberOfLines={1}
                                    >
                                        {formatDayShort(date)}
                                    </AppText>
                                    <Ionicons
                                        name="chevron-down"
                                        size={20}
                                        color={Colors.coral}
                                    />
                                </View>
                                <AppText
                                    variant="caption"
                                    color={Colors.gray500}
                                >
                                    {formatLongDate(date)}
                                </AppText>
                            </View>
                        )}
                    </Pressable>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: Spacing.xs,
                        }}
                    >
                        <IconButton
                            icon="share-outline"
                            accessibilityLabel="Share this day"
                            floating
                            onPress={() => router.push('/share')}
                        />
                        <IconButton
                            icon="settings-outline"
                            accessibilityLabel="Settings"
                            floating
                            onPress={() => router.push('/settings')}
                        />
                    </View>
                </View>

                {/* Week — the arrows inside page the window of days */}
                <WeekStrip
                    selected={date}
                    onSelect={setDate}
                    loggedDays={loggedDays}
                />

                {/* Summary */}
                {settings.trackNutrition && (
                    <DailySummary
                        entries={entries}
                        goals={settings.goals}
                        show={settings.show}
                    />
                )}

                {/* Streak + weight (each toggled in Settings) */}
                {(settings.cards.streak || settings.cards.weight) && (
                    <View
                        style={{
                            flexDirection: 'row',
                            gap: Spacing.sm,
                        }}
                    >
                        {settings.cards.streak && (
                            <Card style={{ flex: 1 }} padding={14}>
                                <View
                                    accessible
                                    accessibilityLabel={`${streak.current} day logging streak`}
                                >
                                    <AppText
                                        variant="label"
                                        color={Colors.gray500}
                                    >
                                        STREAK
                                    </AppText>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: 6,
                                            marginTop: 4,
                                        }}
                                    >
                                        <Text
                                            style={{ fontSize: 22 }}
                                        >
                                            {streak.current > 0
                                                ? '🔥'
                                                : '✨'}
                                        </Text>
                                        <AppText variant="h2">
                                            {streak.current}{' '}
                                            {streak.current === 1
                                                ? 'day'
                                                : 'days'}
                                        </AppText>
                                    </View>
                                    <AppText
                                        variant="caption"
                                        color={Colors.gray500}
                                        numberOfLines={1}
                                    >
                                        {streak.loggedToday
                                            ? 'Logged today'
                                            : streak.current > 0
                                              ? 'Log today to keep it'
                                              : 'Log a meal to start'}
                                    </AppText>
                                </View>
                            </Card>
                        )}

                        {settings.cards.weight && (
                            <Pressable
                                style={{ flex: 1 }}
                                accessibilityRole="button"
                                accessibilityLabel={
                                    weight
                                        ? `Weight ${formatWeight(weight.value, settings.weightUnit)}. Open progress`
                                        : 'Log weight'
                                }
                                onPress={() =>
                                    router.push(
                                        weight
                                            ? '/measurements'
                                            : '/weight'
                                    )
                                }
                            >
                                {({ pressed }) => (
                                    <Card
                                        padding={14}
                                        style={{
                                            flex: 1,
                                            opacity: pressed
                                                ? 0.85
                                                : 1,
                                        }}
                                    >
                                        <AppText
                                            variant="label"
                                            color={Colors.gray500}
                                        >
                                            WEIGHT
                                        </AppText>
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                gap: 6,
                                                marginTop: 4,
                                            }}
                                        >
                                            <Ionicons
                                                name="scale-outline"
                                                size={22}
                                                color={Colors.orange}
                                            />
                                            <AppText variant="h2">
                                                {weight
                                                    ? formatWeight(
                                                          weight.value,
                                                          settings.weightUnit
                                                      )
                                                    : '—'}
                                            </AppText>
                                        </View>
                                        <AppText
                                            variant="caption"
                                            color={
                                                weight
                                                    ? Colors.gray500
                                                    : Colors.coral
                                            }
                                        >
                                            {weight
                                                ? 'See progress'
                                                : '+ Log weight'}
                                        </AppText>
                                    </Card>
                                )}
                            </Pressable>
                        )}
                    </View>
                )}

                {/* Meals */}
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        marginTop: Spacing.xs,
                    }}
                >
                    <AppText variant="h2" accessibilityRole="header">
                        Meals
                    </AppText>
                    {entries.length > 0 && (
                        <AppText
                            variant="caption"
                            color={Colors.gray500}
                        >
                            {entries.length}{' '}
                            {entries.length === 1 ? 'item' : 'items'}
                        </AppText>
                    )}
                </View>

                {loading ? (
                    <ActivityIndicator
                        color={Colors.coral}
                        style={{ marginVertical: 30 }}
                    />
                ) : entries.length === 0 ? (
                    <Card variant="outlined">
                        <EmptyState
                            emoji="📸"
                            title={
                                viewingToday
                                    ? 'Nothing logged yet'
                                    : 'Nothing logged this day'
                            }
                            message="Snap a photo of what you eat. Macros are optional."
                            action={
                                <Button
                                    title="Snap a meal"
                                    icon="camera"
                                    onPress={() =>
                                        router.push({
                                            pathname: '/takephoto',
                                            params: {
                                                next: 'addfood',
                                            },
                                        })
                                    }
                                />
                            }
                        />
                    </Card>
                ) : (
                    <View style={{ gap: Spacing.sm }}>
                        {entries.map((entry) => (
                            <Animated.View
                                key={entry.id}
                                entering={FadeIn.duration(200)}
                                layout={LinearTransition.duration(
                                    200
                                )}
                            >
                                <FoodCard
                                    entry={entry}
                                    compact={
                                        settings.listStyle ===
                                        'compact'
                                    }
                                    onDelete={handleDelete}
                                />
                            </Animated.View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Bottom actions */}
            <View
                pointerEvents="box-none"
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    paddingBottom: insets.bottom + 8,
                    paddingHorizontal: Spacing.md,
                    flexDirection: leftHanded ? 'row-reverse' : 'row',
                    alignItems: 'center',
                    gap: Spacing.xs,
                }}
            >
                <IconButton
                    icon="stats-chart"
                    accessibilityLabel="Progress"
                    size={52}
                    floating
                    color={Colors.orange}
                    onPress={() => router.push('/measurements')}
                />
                <View style={{ flex: 1 }} />
                <IconButton
                    icon="camera"
                    accessibilityLabel="Snap a meal"
                    size={52}
                    floating
                    color={Colors.coral}
                    onPress={() =>
                        router.push({
                            pathname: '/takephoto',
                            params: { next: 'addfood' },
                        })
                    }
                />
                <Button
                    title="Add meal"
                    icon="add"
                    size="lg"
                    floating
                    onPress={() => router.push('/addfood')}
                />
            </View>

            {undo && (
                <Toast
                    message={`Deleted ${undo.name}`}
                    actionLabel="Undo"
                    onAction={handleUndo}
                    bottom={bottomBarHeight + 12}
                />
            )}
        </View>
    )
}

export default Home
