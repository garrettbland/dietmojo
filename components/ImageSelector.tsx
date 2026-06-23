import * as ImagePicker from 'expo-image-picker'
import {
    useLocalSearchParams,
    usePathname,
    useRouter,
} from 'expo-router'
import { Image, Pressable, Text, View } from 'react-native'

/**
 * Grabbed this from the expo docs. Does it even work?
 * https://docs.expo.dev/versions/latest/sdk/image/#usage
 */
const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj['

/**
 * Image Selector component that shows user the "take photo" or "select photo" options. When
 * they select an image, the preview will show. Also handles allowing the user to remove the
 * image selected. This component is used in the add food and edit food screens
 */
export const ImageSelector = ({
    previewUri,
    setPreviewUri,
}: {
    previewUri: string | null
    setPreviewUri: (uri: string | null) => void
}) => {
    const router = useRouter()
    const pathname = usePathname()
    const currentParams = useLocalSearchParams()

    const handleChooseImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 0,
            allowsMultipleSelection: false,
        })

        if (!result.canceled) {
            setPreviewUri(result.assets[0].uri)
        } else {
            alert('You did not select any image.')
        }
    }
    return (
        <View style={{}}>
            {/** Photo Options */}
            {!previewUri && (
                <View
                    style={{
                        flexDirection: 'row',
                    }}
                >
                    {/** Take Photo */}
                    <Pressable
                        style={{
                            width: '50%',
                            height: 150,
                        }}
                        onPress={() => {
                            router.navigate({
                                pathname: '/takephoto',
                                params: {
                                    ...currentParams,
                                    returnToPathName: pathname, // Pass the current path so we know where to return after taking photo
                                },
                            })
                        }}
                    >
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Text>Take Photo</Text>
                        </View>
                    </Pressable>

                    {/** Choose Image */}
                    <Pressable
                        onPress={handleChooseImage}
                        style={{
                            width: '50%',
                            height: 150,
                        }}
                    >
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Text>Choose Image</Text>
                        </View>
                    </Pressable>
                </View>
            )}

            {/** Preview Image */}
            {previewUri && (
                <View style={{ alignItems: 'center' }}>
                    <View
                        style={{
                            backgroundColor: 'red',
                            height: 150,
                            width: 150,
                            position: 'relative',
                        }}
                    >
                        <Pressable
                            onPress={() => setPreviewUri(null)}
                            style={{
                                position: 'absolute',
                                top: 5,
                                right: 5,
                                zIndex: 1,
                                height: 10,
                                width: 10,
                                backgroundColor: 'white',
                            }}
                        >
                            <Text>X</Text>
                        </Pressable>
                        <Image
                            source={{ uri: previewUri }}
                            placeholder={{ blurhash }}
                            contentFit="cover"
                            transition={500}
                            style={{
                                width: '100%',
                                height: '100%',
                            }}
                        />
                    </View>
                </View>
            )}
        </View>
    )
}
