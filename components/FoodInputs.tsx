import { Categories, Colors, Spacing } from '@/constants/theme'
import { NUTRIENTS, useSettings } from '@/lib/settings'
import { sanitizeDecimal } from '@/lib/units'
import { FoodInputsType } from '@/types/types'
import { useRef } from 'react'
import { ScrollView, TextInput, View } from 'react-native'
import { AppText } from './ui/AppText'
import { Chip } from './ui/Chip'
import { TextField } from './ui/TextField'

// Same list the home screen and Settings use, so adding a nutrient
// only has to happen in one place.
const MACROS = NUTRIENTS

export const FoodInputs = ({
    foodInputs,
    setFoodInputs,
    nameError,
}: {
    foodInputs: FoodInputsType
    setFoodInputs: React.Dispatch<
        React.SetStateAction<FoodInputsType>
    >
    nameError?: string
}) => {
    const { trackNutrition } = useSettings()
    const refs = useRef<Record<string, TextInput | null>>({})
    const set = (patch: Partial<FoodInputsType>) =>
        setFoodInputs((prev) => ({ ...prev, ...patch }))

    return (
        <View style={{ gap: Spacing.lg }}>
            <TextField
                label="What did you eat?"
                placeholder="e.g. Chicken burrito bowl"
                value={foodInputs.foodName}
                onChangeText={(foodName) => set({ foodName })}
                autoCapitalize="sentences"
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => refs.current.calories?.focus()}
                error={nameError}
                maxLength={80}
            />

            <View style={{ gap: 8 }}>
                <AppText variant="label" color={Colors.gray700}>
                    Meal
                </AppText>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ gap: 8 }}
                >
                    {Categories.map((c) => (
                        <Chip
                            key={c.key}
                            label={c.label}
                            emoji={c.emoji}
                            selected={foodInputs.category === c.key}
                            onPress={() => set({ category: c.key })}
                        />
                    ))}
                </ScrollView>
            </View>

            {trackNutrition && (
                <View style={{ gap: 8 }}>
                    <AppText variant="label" color={Colors.gray700}>
                        Nutrition{' '}
                        <AppText
                            variant="caption"
                            color={Colors.gray500}
                        >
                            (optional)
                        </AppText>
                    </AppText>
                    <View
                        style={{
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            rowGap: Spacing.sm,
                            columnGap: Spacing.sm,
                        }}
                    >
                        {MACROS.map((m, i) => (
                            <View
                                key={m.key}
                                style={{ width: '48%', flexGrow: 1 }}
                            >
                                <TextField
                                    ref={(r) => {
                                        refs.current[m.key] = r
                                    }}
                                    placeholder={m.label}
                                    accessibilityLabel={`${m.label} in ${m.suffix === 'g' ? 'grams' : 'calories'}`}
                                    suffix={m.suffix}
                                    keyboardType="decimal-pad"
                                    value={foodInputs[m.key]}
                                    onChangeText={(t) =>
                                        set({
                                            [m.key]:
                                                sanitizeDecimal(t),
                                        })
                                    }
                                    returnKeyType={
                                        i < MACROS.length - 1
                                            ? 'next'
                                            : 'done'
                                    }
                                    maxLength={6}
                                    selectTextOnFocus
                                />
                            </View>
                        ))}
                    </View>
                </View>
            )}

            <TextField
                label="Notes"
                placeholder="How did it make you feel? Where was it from?"
                value={foodInputs.notes}
                onChangeText={(notes) => set({ notes })}
                multiline
                style={{ paddingTop: 14, paddingBottom: 14 }}
                maxLength={500}
            />
        </View>
    )
}
