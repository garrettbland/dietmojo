// import { Link } from "expo-router";
import { FoodInputs } from '@/components/FoodInputs'
import { ImageSelector } from '@/components/ImageSelector'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { addEntry } from '@/lib/addEntry'
import { formatDateForSQL } from '@/lib/date'
import { useDate } from '@/providers/DateProvider'
import { FoodInputsType } from '@/types/types'
import {
    Stack,
    useLocalSearchParams,
    useNavigation,
    useRouter,
} from 'expo-router'
import { useEffect, useLayoutEffect, useState } from 'react'
import { Alert, Pressable, ScrollView, Text } from 'react-native'
import {
    SafeAreaView,
    useSafeAreaInsets,
} from 'react-native-safe-area-context'

// import { ThemedText } from '@/components/themed-text';
// import { ThemedView } from '@/components/themed-view';

export default function AddFood() {
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const { date, setDate } = useDate()

    /**
     * tempPhotoUri is the uri of the photo taken in the TakePhoto screen.
     * We use local search params to pass it back to this screen without saving it
     * to the db first. If the user confirms adding the food, then we can save the photo
     * permanently and save the new uri in the db along with the food entry.
     */
    const { tempPhotoUri } = useLocalSearchParams()
    const [previewUri, setPreviewUri] = useState<string | null>(null)
    const navigation = useNavigation()

    const [foodInputs, setFoodInputs] = useState<FoodInputsType>({
        foodName: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
    })

    /**
     * Whenever tempPhotoUri changes (i.e. when we come back from the TakePhoto screen),
     * update the previewUri to show the user a preview of the photo they just took.
     * This way they can confirm it's correct before saving the food entry.
     * If they didn't take a photo, tempPhotoUri will be undefined and we won't show any preview.
     */
    useEffect(() => {
        if (tempPhotoUri) {
            setPreviewUri(tempPhotoUri as string)
        }
    }, [tempPhotoUri])

    const handleAddFood = async () => {
        if (!foodInputs.foodName) {
            Alert.alert('Validation', 'Please enter a food name.')
            return
        }

        const { message } = await addEntry({
            name: foodInputs.foodName,
            photo_uri: previewUri ?? null,
            consumed_at: formatDateForSQL(date), // use the date from DateProvider
            calories: foodInputs.calories || 0,
            protein: foodInputs.protein || 0,
            carbs: foodInputs.carbs || 0,
            fat: foodInputs.fat || 0,
            notes: null, // to do
            category: null, // to do
        })

        if (message === 'SUCCESS') {
            // router.dismiss()
            router.dismissTo({
                pathname: '/',
                params: {
                    status: 'SUCCESSFULLY_ADDED_FOOD',
                    message: `Successfully added ${foodInputs.foodName}`, // to do: make this message more informative and user friendly
                },
            })
        } else {
            /**
             * To do: logging
             */
            Alert.alert(
                'Error',
                'Failed to add food entry. Please try again.'
            )
        }
    }

    useLayoutEffect(() => {
        return
        navigation.setOptions({
            headerRight: () => (
                <Pressable
                    onPress={handleAddFood}
                    style={{
                        height: 36, // somethiing about a height and width of 36 centers
                        width: 36,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    {/* <IconSymbol size={26} name="xmark" color={"black"} /> */}
                    <IconSymbol
                        size={26}
                        name="checkmark"
                        color={'black'}
                    />
                </Pressable>
            ),
        })
    }, [navigation])

    return (
        <>
            <Stack.Toolbar placement="right">
                <Stack.Toolbar.Button
                    icon={'checkmark'}
                    onPress={handleAddFood}
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
                    <ImageSelector
                        previewUri={previewUri}
                        setPreviewUri={setPreviewUri}
                    />

                    {/** Food Inputs */}
                    <FoodInputs
                        foodInputs={foodInputs}
                        setFoodInputs={setFoodInputs}
                    />

                    {/* Date info */}
                    <Pressable
                        onPress={() => router.navigate('/calendar')}
                    >
                        <Text>
                            Consumed food on {date.toDateString()}
                        </Text>
                    </Pressable>
                </SafeAreaView>
            </ScrollView>
        </>
    )
}
