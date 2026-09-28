import { Colors, Spacing, suggestCategory } from '@/constants/theme'
import {
    onDayAtCurrentTime,
    parseLocal,
    toLocalTimestamp,
} from '@/lib/date'
import { addEntry, deleteEntry, updateEntry } from '@/lib/entries'
import { haptic } from '@/lib/haptics'
import { takePendingPhoto } from '@/lib/photoStore'
import { deletePhoto, persistPhoto } from '@/lib/photos'
import { parseNumber } from '@/lib/units'
import { FoodEntry, FoodInputsType } from '@/types/types'
import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { DayPicker } from './DayPicker'
import { FoodInputs } from './FoodInputs'
import { ImageSelector } from './ImageSelector'
import { Button } from './ui/Button'
import { IconButton } from './ui/IconButton'
import { SheetHeader } from './ui/SheetHeader'

const toInputs = (entry?: FoodEntry | null): FoodInputsType => ({
    foodName: entry?.name ?? '',
    calories: entry?.calories ? String(entry.calories) : '',
    protein: entry?.protein ? String(entry.protein) : '',
    carbs: entry?.carbs ? String(entry.carbs) : '',
    fat: entry?.fat ? String(entry.fat) : '',
    fiber: entry?.fiber ? String(entry.fiber) : '',
    notes: entry?.notes ?? '',
    category: entry?.category ?? suggestCategory(),
})

/**
 * Add / edit form. Pass `entry` to edit an existing meal, or
 * `initialDay` to add a new one on that day.
 */
export const FoodForm = ({
    entry,
    initialDay,
}: {
    entry?: FoodEntry | null
    initialDay: Date
}) => {
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const isEdit = !!entry

    const [initial] = useState(() => toInputs(entry))
    const [inputs, setInputs] = useState<FoodInputsType>(initial)
    const [photo, setPhoto] = useState<string | null>(
        entry?.photo_uri ?? null
    )
    const [when, setWhen] = useState<Date>(() =>
        entry
            ? parseLocal(entry.consumed_at)
            : onDayAtCurrentTime(initialDay)
    )
    const [nameError, setNameError] = useState<string>()
    const [saving, setSaving] = useState(false)

    // Pick up a photo coming back from the camera screen
    useFocusEffect(
        useCallback(() => {
            const pending = takePendingPhoto()
            if (pending) setPhoto(pending)
        }, [])
    )

    const originalWhen = entry ? entry.consumed_at : null
    const dirty =
        JSON.stringify(inputs) !== JSON.stringify(initial) ||
        photo !== (entry?.photo_uri ?? null) ||
        (isEdit && toLocalTimestamp(when) !== originalWhen)

    const close = () => {
        if (!dirty) return router.back()
        Alert.alert(
            'Discard changes?',
            isEdit
                ? 'Your edits to this meal will be lost.'
                : 'This meal has not been saved.',
            [
                { text: 'Keep editing', style: 'cancel' },
                {
                    text: 'Discard',
                    style: 'destructive',
                    onPress: () => router.back(),
                },
            ]
        )
    }

    const save = async () => {
        const name = inputs.foodName.trim()
        if (!name) {
            haptic.warning()
            setNameError('Give this meal a name')
            return
        }
        setNameError(undefined)
        setSaving(true)

        try {
            const storedPhoto = photo
                ? await persistPhoto(photo)
                : null
            const data = {
                name,
                photo_uri: storedPhoto,
                notes: inputs.notes.trim() || null,
                consumed_at: toLocalTimestamp(when),
                calories: parseNumber(inputs.calories),
                protein: parseNumber(inputs.protein),
                carbs: parseNumber(inputs.carbs),
                fat: parseNumber(inputs.fat),
                fiber: parseNumber(inputs.fiber),
                category: inputs.category,
            }

            const res = entry
                ? await updateEntry(entry.id, data)
                : await addEntry(data)

            if (!res.ok) throw new Error(res.error)

            // Clean up a replaced/removed photo
            if (entry?.photo_uri && entry.photo_uri !== storedPhoto) {
                deletePhoto(entry.photo_uri)
            }

            haptic.success()
            router.back()
        } catch (error) {
            console.error(error)
            setSaving(false)
            Alert.alert(
                "Couldn't save",
                'Something went wrong saving this meal. Please try again.'
            )
        }
    }

    const remove = () => {
        if (!entry) return
        Alert.alert(
            'Delete meal?',
            `"${entry.name}" will be removed.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const res = await deleteEntry(entry)
                        if (res.ok) {
                            haptic.success()
                            router.back()
                        } else {
                            Alert.alert(
                                "Couldn't delete",
                                'Please try again.'
                            )
                        }
                    },
                },
            ]
        )
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: Colors.background }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <SheetHeader
                title={isEdit ? 'Edit meal' : 'Add meal'}
                onClose={close}
                right={
                    isEdit ? (
                        <IconButton
                            icon="trash-outline"
                            accessibilityLabel="Delete meal"
                            color={Colors.danger}
                            background={Colors.gray50}
                            size={38}
                            onPress={remove}
                        />
                    ) : undefined
                }
            />

            <ScrollView
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                contentContainerStyle={{
                    padding: Spacing.lg,
                    paddingTop: Spacing.xs,
                    gap: Spacing.lg,
                    paddingBottom: 32,
                }}
            >
                <ImageSelector photo={photo} onChange={setPhoto} />

                <FoodInputs
                    foodInputs={inputs}
                    setFoodInputs={setInputs}
                    nameError={nameError}
                />

                <DayPicker
                    label="When"
                    value={when}
                    onChange={setWhen}
                    withTime
                />
            </ScrollView>

            <View
                style={{
                    paddingHorizontal: Spacing.lg,
                    paddingTop: Spacing.sm,
                    paddingBottom: Math.max(
                        insets.bottom,
                        Spacing.md
                    ),
                    backgroundColor: Colors.background,
                    borderTopWidth: 1,
                    borderTopColor: Colors.border,
                }}
            >
                <Button
                    title={isEdit ? 'Save changes' : 'Save meal'}
                    icon="checkmark"
                    size="lg"
                    loading={saving}
                    disabled={isEdit && !dirty}
                    onPress={save}
                />
            </View>
        </KeyboardAvoidingView>
    )
}
