import { DayPicker } from '@/components/DayPicker'
import { AppText } from '@/components/ui/AppText'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { Colors, Spacing } from '@/constants/theme'
import {
    formatDayTitle,
    onDayAtCurrentTime,
    parseLocal,
    startOfDay,
    toDayKey,
    toLocalTimestamp,
} from '@/lib/date'
import { haptic } from '@/lib/haptics'
import {
    getMeasurementForDay,
    getMeasurements,
    upsertDailyMeasurement,
} from '@/lib/measurements'
import { getSettings, useSettings } from '@/lib/settings'
import {
    fromKg,
    parseNumber,
    sanitizeDecimal,
    toKg,
} from '@/lib/units'
import { useDate } from '@/providers/DateProvider'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Alert, View } from 'react-native'

const Weight = () => {
    const router = useRouter()
    const { date } = useDate()
    const { weightUnit: unit } = useSettings()
    /** Optional "YYYY-MM-DD" — set when opened from a past entry */
    const { day } = useLocalSearchParams<{ day?: string }>()

    const [when, setWhen] = useState<Date>(() =>
        day ? startOfDay(parseLocal(day)) : startOfDay(date)
    )
    const [text, setText] = useState('')
    const [hint, setHint] = useState<string>()
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string>()
    const [loggedDays, setLoggedDays] = useState<Set<string>>(
        new Set()
    )

    // Dots in the calendar for days that already have a weigh-in
    useEffect(() => {
        getMeasurements('WEIGHT').then((all) =>
            setLoggedDays(
                new Set(
                    all.map((m) =>
                        toDayKey(parseLocal(m.measured_at))
                    )
                )
            )
        )
    }, [])

    /**
     * Whenever the chosen day changes, show that day's weight if one
     * exists, otherwise clear the field and hint the last known weight.
     */
    useEffect(() => {
        let cancelled = false
        ;(async () => {
            const u = getSettings().weightUnit
            const existing = await getMeasurementForDay(
                'WEIGHT',
                when
            )
            if (cancelled) return
            if (existing) {
                setText(fromKg(existing.value, u).toFixed(1))
                setHint(undefined)
                return
            }
            setText('')
            const all = await getMeasurements('WEIGHT')
            if (cancelled) return
            const last = all[all.length - 1]
            setHint(
                last
                    ? `Last: ${fromKg(last.value, u).toFixed(1)} ${u}`
                    : undefined
            )
        })()
        return () => {
            cancelled = true
        }
    }, [when])

    const save = async () => {
        const value = parseNumber(text)
        const maxValue = unit === 'lb' ? 1000 : 450
        if (value == null || value < 20 || value > maxValue) {
            haptic.warning()
            setError('Enter a valid weight')
            return
        }
        setSaving(true)
        const res = await upsertDailyMeasurement({
            measured_at: toLocalTimestamp(onDayAtCurrentTime(when)),
            type: 'WEIGHT',
            value: toKg(value, unit),
        })
        if (!res.ok) {
            setSaving(false)
            Alert.alert("Couldn't save", 'Please try again.')
            return
        }
        haptic.success()
        router.back()
    }

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: Colors.white,
                padding: Spacing.lg,
                paddingTop: Spacing.xl,
                gap: Spacing.md,
            }}
        >
            <View>
                <AppText variant="h2">Log weight</AppText>
                <AppText variant="caption" color={Colors.gray500}>
                    One entry per day · saving replaces that day
                    {hint ? ` · ${hint}` : ''}
                </AppText>
            </View>

            <DayPicker
                value={when}
                onChange={(d) => {
                    setError(undefined)
                    setWhen(d)
                }}
                markedDays={loggedDays}
            />

            <TextField
                size="lg"
                autoFocus
                placeholder="0.0"
                keyboardType="decimal-pad"
                value={text}
                onChangeText={(t) => {
                    setError(undefined)
                    setText(sanitizeDecimal(t))
                }}
                suffix={unit}
                error={error}
                maxLength={6}
                returnKeyType="done"
                onSubmitEditing={save}
                accessibilityLabel={`Weight in ${unit === 'lb' ? 'pounds' : 'kilograms'}`}
            />

            <Button
                title={`Save for ${formatDayTitle(when).toLowerCase()}`}
                icon="checkmark"
                size="lg"
                loading={saving}
                onPress={save}
            />
        </View>
    )
}

export default Weight
