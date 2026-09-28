import { FoodForm } from '@/components/FoodForm'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Colors } from '@/constants/theme'
import { getEntryById } from '@/lib/entries'
import { useDate } from '@/providers/DateProvider'
import { FoodEntry } from '@/types/types'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'

export default function EditFood() {
    const router = useRouter()
    const { date } = useDate()
    const { id } = useLocalSearchParams<{ id: string }>()
    const [entry, setEntry] = useState<FoodEntry | null | undefined>()

    useEffect(() => {
        getEntryById(Number(id))
            .then(setEntry)
            .catch(() => setEntry(null))
    }, [id])

    if (entry === undefined) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    backgroundColor: Colors.background,
                }}
            >
                <ActivityIndicator color={Colors.coral} />
            </View>
        )
    }

    if (entry === null) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    backgroundColor: Colors.background,
                }}
            >
                <EmptyState
                    emoji="🤔"
                    title="Meal not found"
                    message="It may have been deleted."
                    action={
                        <Button
                            title="Close"
                            onPress={() => router.back()}
                        />
                    }
                />
            </View>
        )
    }

    return <FoodForm entry={entry} initialDay={date} />
}
