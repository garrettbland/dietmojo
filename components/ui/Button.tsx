import {
    ButtonGradient,
    Colors,
    Fonts,
    Radius,
    Shadow,
} from '@/constants/theme'
import { haptic } from '@/lib/haptics'
import Ionicons from '@expo/vector-icons/Ionicons'
import { LinearGradient } from 'expo-linear-gradient'
import { ComponentProps, ReactNode } from 'react'
import {
    ActivityIndicator,
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from 'react-native'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'plain'
type Size = 'sm' | 'md' | 'lg'

type Props = {
    title: string
    onPress?: () => void
    variant?: Variant
    size?: Size
    icon?: ComponentProps<typeof Ionicons>['name']
    loading?: boolean
    disabled?: boolean
    floating?: boolean
    style?: StyleProp<ViewStyle>
    accessibilityLabel?: string
    right?: ReactNode
}

const HEIGHT: Record<Size, number> = { sm: 36, md: 46, lg: 56 }
const FONT: Record<Size, number> = { sm: 14, md: 16, lg: 17 }

/**
 * Pill button following the brand guide.
 * primary = gradient, secondary = outline, ghost = tinted fill.
 */
export const Button = ({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    icon,
    loading,
    disabled,
    floating,
    style,
    accessibilityLabel,
    right,
}: Props) => {
    const isDisabled = disabled || loading

    const textColor =
        variant === 'primary' || variant === 'danger'
            ? Colors.white
            : variant === 'plain'
              ? Colors.gray700
              : Colors.coral

    const content = (
        <View style={styles.row}>
            {loading ? (
                <ActivityIndicator color={textColor} />
            ) : (
                <>
                    {icon && (
                        <Ionicons
                            name={icon}
                            size={FONT[size] + 3}
                            color={textColor}
                        />
                    )}
                    <Text
                        maxFontSizeMultiplier={1.3}
                        style={{
                            fontFamily: Fonts.bold,
                            fontSize: FONT[size],
                            color: textColor,
                        }}
                    >
                        {title}
                    </Text>
                    {right}
                </>
            )}
        </View>
    )

    const base: ViewStyle = {
        height: HEIGHT[size],
        borderRadius: Radius.full,
        paddingHorizontal: size === 'sm' ? 14 : 22,
        justifyContent: 'center',
        overflow: 'hidden',
    }

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel ?? title}
            accessibilityState={{ disabled: !!isDisabled }}
            disabled={isDisabled}
            onPress={() => {
                haptic.light()
                onPress?.()
            }}
            style={({ pressed }) => [
                floating && Shadow.floating,
                {
                    borderRadius: Radius.full,
                    opacity: isDisabled ? 0.5 : 1,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                },
                style,
            ]}
        >
            {variant === 'primary' ? (
                <LinearGradient
                    colors={ButtonGradient.colors}
                    start={ButtonGradient.start}
                    end={ButtonGradient.end}
                    style={base}
                >
                    {content}
                </LinearGradient>
            ) : (
                <View
                    style={[
                        base,
                        variant === 'secondary' && {
                            borderWidth: 1.5,
                            borderColor: Colors.coral,
                            backgroundColor: Colors.white,
                        },
                        variant === 'ghost' && {
                            backgroundColor: Colors.coralTint,
                        },
                        variant === 'danger' && {
                            backgroundColor: Colors.danger,
                        },
                        variant === 'plain' && {
                            backgroundColor: Colors.gray50,
                        },
                    ]}
                >
                    {content}
                </View>
            )}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
})
