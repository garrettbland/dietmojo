import { Colors, Fonts, Radius } from '@/constants/theme'
import { haptic } from '@/lib/haptics'
import { Pressable, Text, View } from 'react-native'

type Props = {
    label: string
    emoji?: string
    selected?: boolean
    onPress?: () => void
}

/** Filter/selection chip (pill). */
export const Chip = ({ label, emoji, selected, onPress }: Props) => (
    <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={() => {
            haptic.selection()
            onPress?.()
        }}
        style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 14,
            height: 36,
            borderRadius: Radius.full,
            borderWidth: 1.5,
            borderColor: selected ? Colors.coral : Colors.border,
            backgroundColor: selected
                ? Colors.coralTint
                : Colors.white,
            opacity: pressed ? 0.8 : 1,
        })}
    >
        {emoji && <Text style={{ fontSize: 15 }}>{emoji}</Text>}
        <Text
            maxFontSizeMultiplier={1.3}
            style={{
                fontFamily: Fonts.bold,
                fontSize: 14,
                color: selected ? Colors.coral : Colors.gray700,
            }}
        >
            {label}
        </Text>
    </Pressable>
)

/** Small square-ish nutrient tag (4px radius per brand guide). */
export const Tag = ({
    label,
    color = Colors.gray700,
    background = Colors.gray50,
}: {
    label: string
    color?: string
    background?: string
}) => (
    <Text
        maxFontSizeMultiplier={1.3}
        style={{
            fontFamily: Fonts.bold,
            fontSize: 12,
            color,
            backgroundColor: background,
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: Radius.xs,
            overflow: 'hidden',
        }}
    >
        {label}
    </Text>
)

/** Segmented control (e.g. Daily / Weekly / Monthly). */
export const Segmented = <T extends string>({
    options,
    value,
    onChange,
}: {
    options: { key: T; label: string }[]
    value: T
    onChange: (key: T) => void
}) => (
    <View
        accessibilityRole="tablist"
        style={{
            flexDirection: 'row',
            backgroundColor: Colors.gray50,
            borderRadius: Radius.full,
            padding: 4,
        }}
    >
        {options.map((o) => {
            const active = o.key === value
            return (
                <Pressable
                    key={o.key}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => {
                        haptic.selection()
                        onChange(o.key)
                    }}
                    style={{
                        flex: 1,
                        height: 34,
                        borderRadius: Radius.full,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: active
                            ? Colors.white
                            : 'transparent',
                    }}
                >
                    <Text
                        maxFontSizeMultiplier={1.3}
                        style={{
                            fontFamily: Fonts.bold,
                            fontSize: 14,
                            color: active
                                ? Colors.coral
                                : Colors.gray500,
                        }}
                    >
                        {o.label}
                    </Text>
                </Pressable>
            )
        })}
    </View>
)
