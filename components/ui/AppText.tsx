import { Colors, Type, TypeVariant } from '@/constants/theme'
import { Text, TextProps } from 'react-native'

type Props = TextProps & {
    variant?: TypeVariant
    color?: string
    align?: 'left' | 'center' | 'right'
}

/**
 * Text with the brand type scale applied. Use this instead of <Text>.
 */
export const AppText = ({
    variant = 'body',
    color = Colors.text,
    align,
    style,
    ...rest
}: Props) => (
    <Text
        {...rest}
        maxFontSizeMultiplier={1.4}
        style={[Type[variant], { color, textAlign: align }, style]}
    />
)
