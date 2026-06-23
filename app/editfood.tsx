import { FoodInputs } from '@/components/FoodInputs'
import { ImageSelector } from '@/components/ImageSelector'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { formatDateForSQL } from '@/lib/date'
import { updateFoodEntry } from '@/lib/updateEntry' // Assuming this function exists, similar to addFoodEntry
import { useDate } from '@/providers/DateProvider'
import { FoodEntry, FoodInputsType } from '@/types/types'
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

export default function EditFood() {
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const { date, setDate } = useDate()

    const { foodItem: foodItemParam, tempPhotoUri } =
        useLocalSearchParams()

    const foodItem = JSON.parse(foodItemParam as string) as FoodEntry // Parse the food item from params

    const [previewUri, setPreviewUri] = useState<string | null>(
        foodItem.photo_uri
    )
    const navigation = useNavigation()
    const [foodInputs, setFoodInputs] = useState<FoodInputsType>({
        foodName: foodItem.name,
        calories: foodItem.calories,
        protein: foodItem.protein,
        carbs: foodItem.carbs,
        fat: foodItem.fat,
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

    const handleUpdateFood = async () => {
        const { message } = await updateFoodEntry({
            id: foodItem.id, // Assuming foodItem has an id
            name: foodInputs.foodName,
            photo_uri: previewUri ?? null,
            consumed_at: formatDateForSQL(date), // Or use foodItem.consumed_at if editing date is not allowed
            calories: foodInputs.calories || 0,
            protein: foodInputs.protein || 0,
            carbs: foodInputs.carbs || 0,
            fat: foodInputs.fat || 0,
            notes: null, // to do
            category: null, // to do
        })

        if (message === 'SUCCESS') {
            router.dismissTo({
                pathname: '/',
                params: {
                    status: 'SUCCESSFULLY_UPDATED_FOOD',
                    message: `Successfully updated ${foodInputs.foodName}`,
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
