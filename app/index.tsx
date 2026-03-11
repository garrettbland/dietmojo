import { SimpleDayNavigator } from '@/components/SimpleDayNavigator'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { useDate } from '@/providers/DateProvider'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import {
    SafeAreaView,
    useSafeAreaInsets,
} from 'react-native-safe-area-context'

const App = () => {
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const { date, setDate } = useDate()
    const [entries, setEntries] = useState<FoodEntry[]>([])
    const [loading, setLoading] = useState(false)

    const fetchFoodEntriesByDay = async (date: Date) => {
        try {
            // Format date as YYYY-MM-DD for consistent comparison
            const dateString = date.toISOString().split('T')[0]

            return []
        } catch (error) {
            console.error('Error fetching food entries:', error)
            return []
        }
    }

    // Fetch entries when date changes
    useEffect(() => {
        const loadEntries = async () => {
            setLoading(true)
            const data = await fetchFoodEntriesByDay(date)
            setEntries(data)
            setLoading(false)
        }

        loadEntries()
    }, [date])

    return (
        <>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <SafeAreaView
                    style={{
                        flex: 1,
                        padding: 15,
                    }}
                >
                    {/* Navbar */}
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        {/* Title */}
                        <View>
                            <Text
                                style={{
                                    fontSize: 30,
                                    fontWeight: '500',
                                }}
                            >
                                Diet Mojo
                            </Text>
                            <Text>Track your meals</Text>
                        </View>

                        {/* Links */}
                        <View
                            style={{
                                flexDirection: 'row',
                                gap: 10,
                                alignItems: 'center',
                            }}
                        >
                            {/* <Pressable onPress={() => router.navigate("/progress")}>
                <Ionicons name="scale" size={24} color="black" />
              </Pressable> */}
                            <Pressable
                                onPress={() =>
                                    router.navigate('/settings')
                                }
                            >
                                <Ionicons
                                    name="settings"
                                    size={24}
                                    color="black"
                                />
                            </Pressable>
                            {/* <Pressable onPress={() => router.navigate("/calendar")}>
                  <IconSymbol size={26} name="calendar" color={"black"} />
                </Pressable> */}
                        </View>
                    </View>

                    {/* Streaks */}
                    <View
                        style={{
                            flexDirection: 'row',
                            marginTop: 40,
                        }}
                    >
                        <View
                            style={{
                                width: '50%',
                                paddingRight: 5,
                            }}
                        >
                            <View
                                style={{
                                    backgroundColor: 'lightgray',
                                    padding: 10,
                                }}
                            >
                                <Text>Current Streak</Text>
                                <Text>🔥 5 Day Streak</Text>
                            </View>
                        </View>
                        <View
                            style={{
                                width: '50%',
                                paddingLeft: 5,
                            }}
                        >
                            <View
                                style={{
                                    backgroundColor: 'teal',
                                    padding: 10,
                                }}
                            >
                                <Text>Current Streak</Text>
                                <Text>🔥 5 Day Streak</Text>
                            </View>
                        </View>
                    </View>

                    <SimpleDayNavigator />

                    {/* Optioanl weight marked complete component */}
                    <View>
                        <Text>Optional weight component</Text>
                    </View>

                    {/* Meals */}
                    <View>
                        <Text>Meals list</Text>
                        {loading ? (
                            <Text>Loading...</Text>
                        ) : entries.length === 0 ? (
                            <Text>No meals logged for today</Text>
                        ) : (
                            entries.map((entry) => (
                                <View
                                    key={entry.id}
                                    style={{
                                        backgroundColor: 'lightgray',
                                        padding: 10,
                                        marginBottom: 10,
                                    }}
                                >
                                    <Text>{entry.name}</Text>
                                    <Text>
                                        {new Date(
                                            entry.created_at * 1000
                                        ).toLocaleTimeString()}
                                    </Text>
                                </View>
                            ))
                        )}
                    </View>
                </SafeAreaView>
            </ScrollView>
            {/* Add meal button */}
            <View
                style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '100%',
                    marginBottom: insets.bottom + 10,
                    height: 50,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexDirection: 'row',
                    paddingHorizontal: 15,
                }}
            >
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 10,
                    }}
                >
                    <Pressable
                        onPress={() => router.navigate('/progress')}
                        style={{
                            backgroundColor: 'blue',
                            padding: 10,
                            borderRadius: 50,
                        }}
                    >
                        <Ionicons
                            name="scale"
                            size={24}
                            color="black"
                        />
                    </Pressable>
                    <Pressable
                        onPress={() => router.navigate('/calendar')}
                        style={{
                            backgroundColor: 'blue',
                            padding: 10,
                            borderRadius: 50,
                        }}
                    >
                        <IconSymbol
                            size={26}
                            name="calendar"
                            color={'black'}
                        />
                    </Pressable>
                </View>
                <Pressable
                    onPress={() => router.navigate('/addfood')}
                    style={{
                        backgroundColor: 'green',
                        padding: 15,
                        borderRadius: 50,
                    }}
                >
                    <Text style={{ color: 'white' }}>Add Meal</Text>
                </Pressable>
            </View>
        </>
    )
}

export default App
