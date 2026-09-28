import { Colors, Radius, Shadow } from '@/constants/theme'
import { haptic } from '@/lib/haptics'
import Ionicons from '@expo/vector-icons/Ionicons'
import { ComponentProps } from 'react'
import { Pressable, StyleProp, ViewStyle } from 'react-native'

type Props = {
    icon: ComponentProps<typeof Ionicons>['name']
    onPress?: () => void
    accessibilityLabel: string
    size?: number
    color?: string
    background?: string
    floating?: boolean
    style?: StyleProp<ViewStyle>
}

/** Round icon-only button (44pt minimum tap target). */
export const IconButton = ({
    icon,
    onPress,
    accessibilityLabel,
    size = 44,
    color = Colors.gray700,
    background = Colors.white,
    floating,
    style,
}: Props) => (
    <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        hitSlop={8}
        onPress={() => {
            haptic.light()
            onPress?.()
        }}
        style={({ pressed }) => [
            {
                width: size,
                height: size,
                borderRadius: Radius.full,
                backgroundColor: background,
                alignItems: 'center',
                justifyContent: 'center',
                transform: [{ scale: pressed ? 0.94 : 1 }],
                opacity: pressed ? 0.85 : 1,
            },
            floating && Shadow.card,
            style,
        ]}
    >
        <Ionicons name={icon} size={size * 0.48} color={color} />
    </Pressable>
)
