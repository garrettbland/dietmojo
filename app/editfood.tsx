import { IconSymbol } from '@/components/ui/icon-symbol'
import { formatDateForSQL } from '@/lib/date'
import { updateFoodEntry } from '@/lib/updateEntry' // Assuming this function exists, similar to addFoodEntry
import { useDate } from '@/providers/DateProvider'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import {
    Stack,
    useLocalSearchParams,
    useNavigation,
    useRouter,
} from 'expo-router'
import { useLayoutEffect, useState } from 'react'
import {
    Alert,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native'
import {
    SafeAreaView,
    useSafeAreaInsets,
} from 'react-native-safe-area-context'

export default function EditFood() {
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const { date, setDate } = useDate()

    const { foodItem: foodItemParam } = useLocalSearchParams()
    const foodItem = JSON.parse(foodItemParam as string) // Parse the food item from params

    const [previewUri, setPreviewUri] = useState<string | null>(
        foodItem.photo_uri
    )
    const navigation = useNavigation()
    const [foodName, setFoodName] = useState(foodItem.name)
    const [calories, setCalories] = useState(
        foodItem.calories.toString()
    )
    const [protein, setProtein] = useState(
        foodItem.protein.toString()
    )
    const [carbs, setCarbs] = useState(foodItem.carbs.toString())
    const [fat, setFat] = useState(foodItem.fat.toString())

    const handleUpdateFood = async () => {
        const { message } = await updateFoodEntry({
            id: foodItem.id, // Assuming foodItem has an id
            name: foodName,
            photo_uri: previewUri ?? null,
            consumed_at: formatDateForSQL(date), // Or use foodItem.consumed_at if editing date is not allowed
            calories: parseInt(calories) || 0,
            protein: parseInt(protein) || 0,
            carbs: parseInt(carbs) || 0,
            fat: parseInt(fat) || 0,
            notes: null, // to do
            category: null, // to do
        })

        if (message === 'SUCCESS') {
            router.dismissTo({
                pathname: '/',
                params: {
                    status: 'SUCCESSFULLY_UPDATED_FOOD',
                    message: `Successfully updated ${foodName}`,
                },
            })
        } else {
            Alert.alert(
                'Error',
                'Failed to update food entry. Please try again.'
            )
        }
    }

    useLayoutEffect(() => {
        return
        navigation.setOptions({
            headerRight: () => (
                <Pressable
                    onPress={handleUpdateFood}
                    style={{
                        height: 36,
                        width: 36,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <IconSymbol
                        size={26}
                        name="checkmark"
                        color={'black'}
                    />
                </Pressable>
            ),
        })
    }, [navigation])

    const blurhash =
        '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj['

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
        <>
            <Stack.Toolbar placement="right">
                <Stack.Toolbar.Button
                    icon={'checkmark'}
                    onPress={handleUpdateFood}
                />
            </Stack.Toolbar>
            <Stack.Toolbar placement="left">
                <Stack.Toolbar.Button
                    icon={'xmark'}
                    onPress={() => router.dismiss()}
                />
            </Stack.Toolbar>

            <ScrollView
                keyboardShouldPersistTaps="always"
                style={{ flex: 1 }}
                contentContainerStyle={{ marginTop: insets.top }}
            >
                <SafeAreaView style={{ padding: 15 }}>
                    {/* Take photo or choose photo component */}
                    <View style={{ backgroundColor: 'orange' }}>
                        <Text>Photo is optional</Text>
                        <View
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                            }}
                        >
                            <Pressable
                                style={{
                                    width: '50%',
                                    height: 150,
                                    backgroundColor: 'gray',
                                }}
                                onPress={() => {
                                    router.navigate('/takephoto')
                                }}
                            >
                                {!previewUri && (
                                    <Text>Take Photo</Text>
                                )}
                                {previewUri && (
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
                                )}
                            </Pressable>
                            <Pressable
                                onPress={handleChooseImage}
                                style={{ width: '50%', height: 150 }}
                            >
                                <Text>Choose Photo</Text>
                            </Pressable>
                        </View>
                    </View>

                    {/* Food name */}
                    <View style={{ backgroundColor: 'red' }}>
                        <Text>Food name</Text>
                        <TextInput
                            style={{
                                height: 40,
                                borderColor: 'gray',
                                borderWidth: 1,
                            }}
                            onChangeText={setFoodName}
                            value={foodName}
                            placeholder="What did you eat?"
                            returnKeyType="done"
                        />
                    </View>

                    {/* Optional macros inputs */}
                    <View>
                        <Text>Add Macros (Optional)</Text>
                        <View
                            style={{
                                flexDirection: 'row',
                                flexWrap: 'wrap',
                            }}
                        >
                            <View
                                style={{
                                    width: '50%',
                                    paddingRight: 5,
                                }}
                            >
                                <Text>Calories</Text>
                                <TextInput
                                    style={{
                                        height: 40,
                                        borderColor: 'gray',
                                        borderWidth: 1,
                                    }}
                                    onChangeText={setCalories}
                                    value={calories}
                                    placeholder="0"
                                    keyboardType="numeric"
                                />
                            </View>

                            {/* Protein */}
                            <View
                                style={{
                                    width: '50%',
                                    paddingLeft: 5,
                                }}
                            >
                                <Text>Protein (grams)</Text>
                                <TextInput
                                    style={{
                                        height: 40,
                                        borderColor: 'gray',
                                        borderWidth: 1,
                                    }}
                                    onChangeText={setProtein}
                                    value={protein}
                                    placeholder="0"
                                    keyboardType="numeric"
                                />
                            </View>

                            {/* Carbs */}
                            <View
                                style={{
                                    width: '50%',
                                    paddingRight: 5,
                                }}
                            >
                                <Text>Carbs (grams)</Text>
                                <TextInput
                                    style={{
                                        height: 40,
                                        borderColor: 'gray',
                                        borderWidth: 1,
                                    }}
                                    onChangeText={setCarbs}
                                    value={carbs}
                                    placeholder="0"
                                    keyboardType="numeric"
                                />
                            </View>

                            {/* Fat */}
                            <View
                                style={{
                                    width: '50%',
                                    paddingRight: 5,
                                }}
                            >
                                <Text>Fat (grams)</Text>
                                <TextInput
                                    style={{
                                        height: 40,
                                        borderColor: 'gray',
                                        borderWidth: 1,
                                    }}
                                    onChangeText={setFat}
                                    value={fat}
                                    placeholder="0"
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Date info */}
                    <Text>Logging for date/date/date</Text>
                </SafeAreaView>
            </ScrollView>
        </>
    )
}
