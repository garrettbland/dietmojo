import { SimpleDayNavigator } from '@/components/SimpleDayNavigator'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { deleteFoodItem } from '@/lib/deleteEntry'
import { getEntriesByDate } from '@/lib/getEntries'
import { useDate } from '@/providers/DateProvider'
import { FoodEntry } from '@/types/types'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Image } from 'expo-image'
import {
    useLocalSearchParams,
    usePathname,
    useRouter,
} from 'expo-router'
import { useEffect, useState } from 'react'
import {
    Alert,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable'
import {
    SafeAreaView,
    useSafeAreaInsets,
} from 'react-native-safe-area-context'

const RightAction = (onDelete: () => void) => (
    <TouchableOpacity
        onPress={onDelete}
        style={{
            backgroundColor: 'red',
            justifyContent: 'center',
            padding: 20,
        }}
    >
        <Text style={{ color: 'white' }}>Delete</Text>
    </TouchableOpacity>
)

/**
 * Grabbed this from the expo docs. Does it even work?
 * https://docs.expo.dev/versions/latest/sdk/image/#usage
 */
const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj['

const App = () => {
    const router = useRouter()
    const pathname = usePathname()
    const insets = useSafeAreaInsets()
    const { date, setDate } = useDate()
    const [entries, setEntries] = useState<FoodEntry[]>([])
    const [loading, setLoading] = useState(false)

    const { status, message } = useLocalSearchParams()

    const loadEntries = async () => {
        setLoading(true)
        const data = await getEntriesByDate(date)
        setEntries(data)
        setLoading(false)
    }

    // Fetch entries when date changes
    useEffect(() => {
        /**
         * Only fetch entries if we're on the home screen.
         * This prevents refetching when we navigate back from add food or other screens.
         *  We still want to refetch when date changes or when screen is focused,
         * but not on every navigation event.
         */
        // if (pathname !== '/') {
        //     return
        // }

        loadEntries()
    }, [date]) // also refetch when screen is focused

    useEffect(() => {
        if (status === 'SUCCESSFULLY_ADDED_FOOD') {
            loadEntries()
        }

        if (status === 'SUCCESSFULLY_UPDATED_FOOD') {
            loadEntries()
        }

        router.setParams({ status: undefined })
    }, [status])

    const handleDelete = (id: number) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this entry?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        deleteFoodItem(id).then(({ message }) => {
                            if (message === 'SUCCESS') {
                                // Filter out deleted entry. No need to refetch entire list from db
                                const filteredEntries =
                                    entries.filter(
                                        (entry) => entry.id !== id
                                    )
                                setEntries(filteredEntries)
                            } else {
                                Alert.alert(
                                    'Error',
                                    'Failed to delete entry. Please try again.'
                                )
                            }
                        })
                    },
                },
            ]
        )
    }

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
                        {/* <View>
                            <Text
                                style={{
                                    fontSize: 30,
                                    fontWeight: '500',
                                }}
                            >
                                Diet Mojo
                            </Text>
                            <Text>Track your meals</Text>
                        </View> */}

                        {/** Date */}
                        <View>
                            <Text
                                style={{
                                    fontSize: 18,
                                    fontWeight: '500',
                                }}
                                onPress={() =>
                                    router.navigate('/calendar')
                                }
                            >
                                {new Date(date).toLocaleDateString(
                                    undefined,
                                    {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric',
                                    }
                                )}
                            </Text>
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
                            display: 'none',
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

                    <View style={{ display: 'none' }}>
                        <SimpleDayNavigator />
                    </View>

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
                                    style={{ marginBottom: 10 }}
                                    key={entry.id}
                                >
                                    <TouchableOpacity
                                        onPress={() =>
                                            router.navigate(
                                                `/editfood?foodItem=${JSON.stringify(entry)}`
                                            )
                                        }
                                    >
                                        <ReanimatedSwipeable
                                            renderRightActions={() =>
                                                RightAction(() =>
                                                    handleDelete(
                                                        entry.id
                                                    )
                                                )
                                            }
                                        >
                                            <View
                                                style={{
                                                    backgroundColor:
                                                        'lightgray',
                                                    padding: 10,
                                                }}
                                            >
                                                <Text>
                                                    {entry.name}
                                                </Text>
                                                <Text>
                                                    {entry.created_at}{' '}
                                                    {
                                                        entry.consumed_at
                                                    }
                                                </Text>
                                                {entry.photo_uri && (
                                                    <Image
                                                        source={{
                                                            uri: entry.photo_uri,
                                                        }}
                                                        style={{
                                                            width: 100,
                                                            height: 100,
                                                        }}
                                                        contentFit="cover" // like object-fit: cover
                                                        transition={
                                                            200
                                                        } // fade in ms
                                                        placeholder={
                                                            blurhash
                                                        } // show while loading
                                                    />
                                                )}
                                            </View>
                                        </ReanimatedSwipeable>
                                    </TouchableOpacity>
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
                        onPress={() =>
                            router.navigate('/measurements')
                        }
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
