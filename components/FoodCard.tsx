import { FoodEntry } from '@/types/types'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { Text, TouchableOpacity, View } from 'react-native'
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable'

/**
 * Grabbed this from the expo docs. Does it even work?
 * https://docs.expo.dev/versions/latest/sdk/image/#usage
 */
const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj['

/**
 * FoodCard component that displays a food entry and allows navigation to edit or delete the entry. It uses ReanimatedSwipeable for swipe-to-delete functionality.
 */
export const FoodCard = ({
    entry,
    onDelete,
}: {
    entry: FoodEntry
    onDelete: () => void
}) => {
    const router = useRouter()
    return (
        <View style={{ marginBottom: 10 }} key={entry.id}>
            <TouchableOpacity
                onPress={() =>
                    router.navigate(
                        `/editfood?foodItem=${JSON.stringify(entry)}`
                    )
                }
            >
                <ReanimatedSwipeable
                    renderRightActions={() => {
                        return (
                            <TouchableOpacity
                                onPress={onDelete}
                                style={{
                                    backgroundColor: 'red',
                                    justifyContent: 'center',
                                    padding: 20,
                                }}
                            >
                                <Text style={{ color: 'white' }}>
                                    Delete
                                </Text>
                            </TouchableOpacity>
                        )
                    }}
                >
                    <View
                        style={{
                            backgroundColor: 'lightgray',
                            padding: 10,
                        }}
                    >
                        <Text>{entry.name}</Text>
                        <Text>
                            {entry.created_at} {entry.consumed_at}
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
                                transition={200} // fade in ms
                                placeholder={blurhash} // show while loading
                            />
                        )}
                    </View>
                </ReanimatedSwipeable>
            </TouchableOpacity>
        </View>
    )
}
