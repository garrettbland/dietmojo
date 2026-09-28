import {
    Colors,
    getCategory,
    Radius,
    Shadow,
} from '@/constants/theme'
import { formatTime, parseLocal } from '@/lib/date'
import { haptic } from '@/lib/haptics'
import { resolvePhotoUri } from '@/lib/photos'
import { formatNumber } from '@/lib/units'
import { FoodEntry } from '@/types/types'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useRef } from 'react'
import { Pressable, Text, View } from 'react-native'
import ReanimatedSwipeable, {
    SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable'
import { AppText } from './ui/AppText'
import { Tag } from './ui/Chip'

/**
 * A logged meal. Tap to edit, swipe left to delete.
 */
export const FoodCard = ({
    entry,
    onDelete,
    compact,
}: {
    entry: FoodEntry
    onDelete: (entry: FoodEntry) => void
    compact?: boolean
}) => {
    const router = useRouter()
    const swipeRef = useRef<SwipeableMethods>(null)
    const category = getCategory(entry.category)
    const photo = resolvePhotoUri(entry.photo_uri)
    const time = formatTime(parseLocal(entry.consumed_at))
    const thumb = compact ? 44 : 68

    const hasMacros = !!entry.protein || !!entry.carbs || !!entry.fat

    return (
        <ReanimatedSwipeable
            ref={swipeRef}
            friction={2}
            rightThreshold={40}
            overshootRight={false}
            onSwipeableWillOpen={() => haptic.light()}
            containerStyle={{ borderRadius: Radius.card }}
            renderRightActions={() => (
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${entry.name}`}
                    onPress={() => {
                        swipeRef.current?.close()
                        onDelete(entry)
                    }}
                    style={{
                        width: 88,
                        marginLeft: 8,
                        borderRadius: Radius.card,
                        backgroundColor: Colors.danger,
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                    }}
                >
                    <Ionicons name="trash" size={22} color="white" />
                    <AppText variant="label" color={Colors.white}>
                        Delete
                    </AppText>
                </Pressable>
            )}
        >
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${entry.name}, ${category.label} at ${time}${entry.calories ? `, ${entry.calories} calories` : ''}`}
                accessibilityHint="Opens the meal to edit. Swipe left to delete."
                onPress={() =>
                    router.push({
                        pathname: '/editfood',
                        params: { id: String(entry.id) },
                    })
                }
                style={({ pressed }) => [
                    {
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        padding: compact ? 10 : 12,
                        borderRadius: Radius.card,
                        backgroundColor: pressed
                            ? Colors.gray50
                            : Colors.white,
                    },
                    Shadow.card,
                ]}
            >
                {photo ? (
                    <Image
                        source={{ uri: photo }}
                        style={{
                            width: thumb,
                            height: thumb,
                            borderRadius: Radius.md,
                            backgroundColor: Colors.gray50,
                        }}
                        contentFit="cover"
                        transition={150}
                        recyclingKey={String(entry.id)}
                    />
                ) : (
                    <View
                        style={{
                            width: thumb,
                            height: thumb,
                            borderRadius: Radius.md,
                            backgroundColor: Colors.orangeTint,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Text style={{ fontSize: compact ? 20 : 28 }}>
                            {category.emoji}
                        </Text>
                    </View>
                )}

                <View style={{ flex: 1, gap: 2 }}>
                    <AppText variant="bodyStrong" numberOfLines={1}>
                        {entry.name}
                    </AppText>
                    <AppText variant="caption" color={Colors.gray500}>
                        {category.label} · {time}
                    </AppText>
                    {!compact && hasMacros && (
                        <View
                            style={{
                                flexDirection: 'row',
                                gap: 4,
                                marginTop: 4,
                            }}
                        >
                            <Tag
                                label={`P ${formatNumber(entry.protein)}g`}
                            />
                            <Tag
                                label={`C ${formatNumber(entry.carbs)}g`}
                            />
                            <Tag
                                label={`F ${formatNumber(entry.fat)}g`}
                            />
                        </View>
                    )}
                </View>

                {!!entry.calories && (
                    <View style={{ alignItems: 'flex-end' }}>
                        <AppText variant="h3" color={Colors.text}>
                            {formatNumber(entry.calories)}
                        </AppText>
                        <AppText
                            variant="caption"
                            color={Colors.gray500}
                        >
                            kcal
                        </AppText>
                    </View>
                )}
            </Pressable>
        </ReanimatedSwipeable>
    )
}
