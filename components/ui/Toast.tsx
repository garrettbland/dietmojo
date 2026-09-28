import { Colors, Fonts, Radius, Shadow } from '@/constants/theme'
import { Pressable, Text, View } from 'react-native'
import Animated, {
    FadeInDown,
    FadeOutDown,
} from 'react-native-reanimated'

/** Dark snackbar with an optional action (e.g. Undo). */
export const Toast = ({
    message,
    actionLabel,
    onAction,
    bottom,
}: {
    message: string
    actionLabel?: string
    onAction?: () => void
    bottom: number
}) => (
    <Animated.View
        entering={FadeInDown.duration(200)}
        exiting={FadeOutDown.duration(200)}
        accessibilityLiveRegion="polite"
        style={[
            {
                position: 'absolute',
                left: 16,
                right: 16,
                bottom,
                borderRadius: Radius.lg,
                backgroundColor: Colors.gray900,
                paddingLeft: 16,
                paddingRight: 6,
                minHeight: 50,
                flexDirection: 'row',
                alignItems: 'center',
            },
            Shadow.card,
        ]}
    >
        <Text
            style={{
                flex: 1,
                color: Colors.white,
                fontFamily: Fonts.bodySemiBold,
                fontSize: 15,
            }}
            numberOfLines={2}
        >
            {message}
        </Text>
        {actionLabel && (
            <Pressable
                onPress={onAction}
                accessibilityRole="button"
                style={{ paddingHorizontal: 14, paddingVertical: 12 }}
            >
                <Text
                    style={{
                        color: Colors.golden,
                        fontFamily: Fonts.extraBold,
                        fontSize: 15,
                    }}
                >
                    {actionLabel}
                </Text>
            </Pressable>
        )}
        {!actionLabel && <View style={{ width: 10 }} />}
    </Animated.View>
)
