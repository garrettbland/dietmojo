import { AppText } from '@/components/ui/AppText'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Segmented } from '@/components/ui/Chip'
import { EmptyState } from '@/components/ui/EmptyState'
import { SheetHeader } from '@/components/ui/SheetHeader'
import { ChartPoint, WeightChart } from '@/components/WeightChart'
import { Colors, Radius, Spacing } from '@/constants/theme'
import { addDays, formatDayTitle, parseLocal } from '@/lib/date'
import { haptic } from '@/lib/haptics'
import {
    deleteMeasurement,
    getMeasurements,
} from '@/lib/measurements'
import { useSettings } from '@/lib/settings'
import { fromKg } from '@/lib/units'
import { MeasurementEntry } from '@/types/types'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type Range = '1m' | '3m' | '12m' | 'all'

const RANGES: { key: Range; label: string; days?: number }[] = [
    { key: '1m', label: '1M', days: 30 },
    { key: '3m', label: '3M', days: 90 },
    { key: '12m', label: '12M', days: 365 },
    { key: 'all', label: 'All' },
]

const Progress = () => {
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const { weightUnit: unit } = useSettings()
    const [range, setRange] = useState<Range>('1m')
    const [records, setRecords] = useState<MeasurementEntry[]>([])
    const [loading, setLoading] = useState(true)

    const load = useCallback(async () => {
        const days = RANGES.find((r) => r.key === range)?.days
        const from = days ? addDays(new Date(), -days) : undefined
        try {
            setRecords(await getMeasurements('WEIGHT', from))
        } finally {
            setLoading(false)
        }
    }, [range])

    useFocusEffect(
        useCallback(() => {
            load()
        }, [load])
    )

    const points: ChartPoint[] = useMemo(
        () =>
            records.map((r) => {
                const d = parseLocal(r.measured_at)
                return {
                    t: d.getTime(),
                    value: fromKg(r.value, unit),
                    label: d.toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                    }),
                }
            }),
        [records, unit]
    )

    const latest = points[points.length - 1]
    const first = points[0]
    const change = latest && first ? latest.value - first.value : 0

    const confirmDelete = (m: MeasurementEntry) => {
        Alert.alert(
            'Delete entry?',
            `${fromKg(m.value, unit).toFixed(1)} ${unit} on ${formatDayTitle(parseLocal(m.measured_at))}`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteMeasurement(m.id)
                        haptic.success()
                        load()
                    },
                },
            ]
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: Colors.background }}>
            <SheetHeader
                title="Progress"
                subtitle="Weight over time"
            />

            <ScrollView
                contentContainerStyle={{
                    padding: Spacing.lg,
                    paddingTop: Spacing.xs,
                    gap: Spacing.md,
                    paddingBottom: 120 + insets.bottom,
                }}
            >
                <Segmented
                    options={RANGES}
                    value={range}
                    onChange={setRange}
                />

                {loading ? (
                    <ActivityIndicator
                        color={Colors.coral}
                        style={{ marginTop: 40 }}
                    />
                ) : points.length === 0 ? (
                    <Card variant="outlined">
                        <EmptyState
                            emoji="⚖️"
                            title="No weigh-ins yet"
                            message={
                                range === 'all'
                                    ? 'Log your weight to start seeing your trend.'
                                    : 'Nothing logged in this range.'
                            }
                        />
                    </Card>
                ) : (
                    <>
                        {/* Headline */}
                        <View
                            style={{
                                flexDirection: 'row',
                                gap: Spacing.sm,
                            }}
                        >
                            <Card style={{ flex: 1 }} padding={14}>
                                <AppText
                                    variant="label"
                                    color={Colors.gray500}
                                >
                                    CURRENT
                                </AppText>
                                <AppText variant="h1">
                                    {latest.value.toFixed(1)}
                                    <AppText
                                        variant="body"
                                        color={Colors.gray500}
                                    >
                                        {' '}
                                        {unit}
                                    </AppText>
                                </AppText>
                            </Card>
                            <Card style={{ flex: 1 }} padding={14}>
                                <AppText
                                    variant="label"
                                    color={Colors.gray500}
                                >
                                    CHANGE
                                </AppText>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 4,
                                    }}
                                >
                                    {Math.abs(change) >= 0.05 && (
                                        <Ionicons
                                            name={
                                                change < 0
                                                    ? 'arrow-down'
                                                    : 'arrow-up'
                                            }
                                            size={20}
                                            color={Colors.gray700}
                                        />
                                    )}
                                    <AppText variant="h1">
                                        {Math.abs(change).toFixed(1)}
                                        <AppText
                                            variant="body"
                                            color={Colors.gray500}
                                        >
                                            {' '}
                                            {unit}
                                        </AppText>
                                    </AppText>
                                </View>
                            </Card>
                        </View>

                        <Card padding={14}>
                            <WeightChart
                                points={points}
                                unit={unit}
                            />
                        </Card>

                        {/* Entries (table view) */}
                        <AppText
                            variant="h3"
                            style={{ marginTop: Spacing.xs }}
                        >
                            Entries
                        </AppText>
                        <Card padding={0}>
                            {[...records].reverse().map((m, i) => (
                                <Pressable
                                    key={m.id}
                                    onPress={() =>
                                        router.push({
                                            pathname: '/weight',
                                            params: {
                                                day: m.measured_at.slice(
                                                    0,
                                                    10
                                                ),
                                            },
                                        })
                                    }
                                    onLongPress={() =>
                                        confirmDelete(m)
                                    }
                                    accessibilityHint="Opens this day to edit the weight"
                                    style={({ pressed }) => ({
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingHorizontal: 16,
                                        paddingVertical: 14,
                                        borderTopWidth: i ? 1 : 0,
                                        borderTopColor: Colors.border,
                                        backgroundColor: pressed
                                            ? Colors.gray50
                                            : 'transparent',
                                        borderRadius: Radius.card,
                                    })}
                                >
                                    <AppText
                                        variant="body"
                                        style={{ flex: 1 }}
                                    >
                                        {formatDayTitle(
                                            parseLocal(m.measured_at)
                                        )}
                                    </AppText>
                                    <AppText variant="bodyStrong">
                                        {fromKg(
                                            m.value,
                                            unit
                                        ).toFixed(1)}{' '}
                                        {unit}
                                    </AppText>
                                    <Pressable
                                        hitSlop={10}
                                        accessibilityRole="button"
                                        accessibilityLabel="Delete entry"
                                        onPress={() =>
                                            confirmDelete(m)
                                        }
                                        style={{ marginLeft: 12 }}
                                    >
                                        <Ionicons
                                            name="trash-outline"
                                            size={18}
                                            color={Colors.gray300}
                                        />
                                    </Pressable>
                                </Pressable>
                            ))}
                        </Card>
                    </>
                )}
            </ScrollView>

            <View
                style={{
                    position: 'absolute',
                    left: Spacing.lg,
                    right: Spacing.lg,
                    bottom: insets.bottom + 12,
                }}
            >
                <Button
                    title="Log weight"
                    icon="add"
                    size="lg"
                    floating
                    onPress={() => router.push('/weight')}
                />
            </View>
        </View>
    )
}

export default Progress
