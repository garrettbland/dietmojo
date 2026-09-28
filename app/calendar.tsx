import { MonthCalendar } from '@/components/MonthCalendar'
import { AppText } from '@/components/ui/AppText'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { Colors, Spacing } from '@/constants/theme'
import { addDays } from '@/lib/date'
import { getLoggedDays, getStreak } from '@/lib/entries'
import { useDate } from '@/providers/DateProvider'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Text, View } from 'react-native'

export default function Calendar() {
    const router = useRouter()
    const { date, setDate } = useDate()
    const [logged, setLogged] = useState<Set<string>>(new Set())
    const [streak, setStreak] = useState(0)

    useEffect(() => {
        const today = new Date()
        getLoggedDays(addDays(today, -730), today).then(setLogged)
        getStreak().then((s) => setStreak(s.current))
    }, [])

    const select = (d: Date) => {
        setDate(d)
        router.back()
    }

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: Colors.white,
                paddingHorizontal: Spacing.lg,
                paddingTop: Spacing.xl,
            }}
        >
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: Spacing.xs,
                }}
            >
                <View>
                    <AppText variant="h2">History</AppText>
                    <AppText variant="caption" color={Colors.gray500}>
                        <Text style={{ color: Colors.orange }}>
                            ●
                        </Text>{' '}
                        days with meals · 🔥 {streak} day streak
                    </AppText>
                </View>
                <IconButton
                    icon="close"
                    accessibilityLabel="Close"
                    background={Colors.gray50}
                    size={38}
                    onPress={() => router.back()}
                />
            </View>

            <MonthCalendar
                value={date}
                onSelect={select}
                markedDays={logged}
            />

            <Button
                title="Jump to today"
                variant="ghost"
                icon="today-outline"
                style={{ marginTop: Spacing.sm }}
                onPress={() => select(new Date())}
            />
        </View>
    )
}
