import { FoodInputsType } from '@/types/types'
import { Text, TextInput, View } from 'react-native'

export const FoodInputs = ({
    foodInputs,
    setFoodInputs,
}: {
    foodInputs: FoodInputsType
    setFoodInputs: React.Dispatch<
        React.SetStateAction<FoodInputsType>
    >
}) => {
    return (
        <View>
            {/* Food name */}
            <View style={{}}>
                <Text>Food name</Text>
                <TextInput
                    style={{
                        height: 40,
                        borderColor: 'gray',
                        borderWidth: 1,
                    }}
                    onChangeText={(text) =>
                        setFoodInputs((prev) => ({
                            ...prev,
                            foodName: text,
                        }))
                    }
                    placeholder="What did you eat?"
                    returnKeyType="done"
                    value={foodInputs.foodName}
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
                            onChangeText={(text) =>
                                setFoodInputs((prev) => ({
                                    ...prev,
                                    calories: Number(text),
                                }))
                            }
                            placeholder="0"
                            keyboardType="numeric"
                            value={foodInputs.calories.toString()}
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
                            onChangeText={(text) =>
                                setFoodInputs((prev) => ({
                                    ...prev,
                                    protein: Number(text),
                                }))
                            }
                            placeholder="0"
                            keyboardType="numeric"
                            value={foodInputs.protein.toString()}
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
                            onChangeText={(text) =>
                                setFoodInputs((prev) => ({
                                    ...prev,
                                    carbs: Number(text),
                                }))
                            }
                            placeholder="0"
                            keyboardType="numeric"
                            value={foodInputs.carbs.toString()}
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
                            onChangeText={(text) =>
                                setFoodInputs((prev) => ({
                                    ...prev,
                                    fat: Number(text),
                                }))
                            }
                            placeholder="0"
                            keyboardType="numeric"
                            value={foodInputs.fat.toString()}
                        />
                    </View>
                </View>
            </View>
        </View>
    )
}
