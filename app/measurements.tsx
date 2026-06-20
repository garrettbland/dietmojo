import { getMeasurementsByDate } from '@/lib/getMeasurements'
import { useDate } from '@/providers/DateProvider'
import { MeasurementEntry } from '@/types/types'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const Progress = () => {
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const { date, setDate } = useDate()
    const [records, setRecords] = useState<MeasurementEntry[]>([])
    const [loading, setLoading] = useState(false)
    const { status, message } = useLocalSearchParams()

    const loadRecords = async () => {
        setLoading(true)
        const data = await getMeasurementsByDate(date)
        setRecords(data)
        setLoading(false)
    }

    useEffect(() => {
        loadRecords()
    }, [date]) // also refetch when screen is focused

    useEffect(() => {
        if (status === 'SUCCESSFULLY_ADDED_MEASUREMENT') {
            loadRecords()
        }

        if (status === 'SUCCESSFULLY_UPDATED_MEASUREMENT') {
            loadRecords()
        }

        router.setParams({ status: undefined })
    }, [status])

    return (
        <View style={{ flex: 1, backgroundColor: 'blue' }}>
            {/* Nav */}
            <View
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'red',
                }}
            >
                <View>
                    <Text
                        style={{
                            fontSize: 18,
                            fontWeight: '500',
                        }}
                    >
                        Progress
                    </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Text>Share</Text>
                    <Text onPress={() => router.dismiss()}>X</Text>
                </View>
            </View>

            {/* Quick date picker */}
            <View>
                <Text>Quick Date Component</Text>
            </View>

            {/* Todays weight logged */}
            <View>
                <Text>Todays date logged</Text>
            </View>

            {/* Tabs for weight, chest, waiste, etc */}
            <View>
                <Text>Tabs for weight, chest, etc?</Text>
            </View>

            {/* Weight graph */}
            <View style={{ height: 500, backgroundColor: 'orange' }}>
                {loading ? (
                    <Text>Loading...</Text>
                ) : records.length === 0 ? (
                    <Text>No measurements for this date.</Text>
                ) : (
                    records.map((record, index) => (
                        <View key={index}>
                            <Text>{record.type}</Text>
                            <Text>{record.value}</Text>
                        </View>
                    ))
                )}
            </View>

            {/* Tabs for date range */}
            <View>
                <Text>Tabs for weight, chest, etc?</Text>
            </View>

            {/* Submit Button */}
            <View
                style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '100%',
                    marginBottom: insets.bottom + 10,
                    height: 50,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Text onPress={() => router.navigate('/weight')}>
                    Log Weight
                </Text>
            </View>
        </View>
    )
}

export default Progress
