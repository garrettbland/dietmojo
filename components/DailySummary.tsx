import { Colors, Fonts, Radius } from '@/constants/theme'
import { NUTRIENTS, Settings } from '@/lib/settings'
import { formatNumber } from '@/lib/units'
import { FoodEntry } from '@/types/types'
import { Text, View } from 'react-native'
import { AppText } from './ui/AppText'
import { Card } from './ui/Card'

export const sumEntries = (entries: FoodEntry[]) =>
    entries.reduce(
        (acc, e) => ({
            calories: acc.calories + (e.calories ?? 0),
            protein: acc.protein + (e.protein ?? 0),
            carbs: acc.carbs + (e.carbs ?? 0),
            fat: acc.fat + (e.fat ?? 0),
            fiber: acc.fiber + (e.fiber ?? 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    )

const Bar = ({ value, goal }: { value: number; goal: number }) => {
    const pct = goal > 0 ? Math.min(value / goal, 1) : 0
    return (
        <View
            style={{
                height: 8,
                borderRadius: Radius.full,
                backgroundColor: 'rgba(255,255,255,0.35)',
                overflow: 'hidden',
            }}
        >
            <View
                style={{
                    width: `${pct * 100}%`,
                    height: '100%',
                    borderRadius: Radius.full,
                    backgroundColor: Colors.white,
                }}
            />
        </View>
    )
}

/** One nutrient: name, value against goal, and a progress bar. */
const NutrientRow = ({
    label,
    value,
    goal,
    suffix,
}: {
    label: string
    value: number
    goal: number
    suffix: string
}) => (
    <View style={{ gap: 6 }}>
        <View
            style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: 8,
            }}
        >
            <AppText variant="bodyStrong" color={Colors.white}>
                {label}
            </AppText>
            <Text
                maxFontSizeMultiplier={1.2}
                style={{
                    fontFamily: Fonts.bodySemiBold,
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.9)',
                }}
            >
                {formatNumber(Math.round(value))}/{goal}
                {suffix === 'g' ? 'g' : ''}
            </Text>
        </View>
        <Bar value={value} goal={goal} />
    </View>
)

/**
 * Day progress for whichever nutrients are enabled in Settings.
 * Every nutrient gets the same row; nothing renders when they are
 * all switched off.
 */
export const DailySummary = ({
    entries,
    goals,
    show,
}: {
    entries: FoodEntry[]
    goals: Settings['goals']
    show: Settings['show']
}) => {
    const totals = sumEntries(entries)
    const enabled = NUTRIENTS.filter((n) => show[n.key])
    if (enabled.length === 0) return null

    return (
        <Card variant="gradient" padding={20}>
            <View
                style={{ gap: 16 }}
                accessible
                accessibilityLabel={enabled
                    .map(
                        (n) =>
                            `${n.label} ${Math.round(totals[n.key])} of ${goals[n.key]}`
                    )
                    .join(', ')}
            >
                {enabled.map((n) => (
                    <NutrientRow
                        key={n.key}
                        label={n.label}
                        value={totals[n.key]}
                        goal={goals[n.key]}
                        suffix={n.suffix}
                    />
                ))}
            </View>
        </Card>
    )
}
