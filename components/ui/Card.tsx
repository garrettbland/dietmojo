import { Colors, Gradient, Radius, Shadow } from '@/constants/theme'
import { LinearGradient } from 'expo-linear-gradient'
import { ReactNode } from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'

type Props = {
    children: ReactNode
    variant?: 'default' | 'gradient' | 'outlined'
    padding?: number
    style?: StyleProp<ViewStyle>
}

export const Card = ({
    children,
    variant = 'default',
    padding = 16,
    style,
}: Props) => {
    if (variant === 'gradient') {
        return (
            <LinearGradient
                colors={Gradient.colors}
                start={Gradient.start}
                end={Gradient.end}
                style={[
                    { borderRadius: Radius.card, padding },
                    Shadow.floating,
                    style,
                ]}
            >
                {children}
            </LinearGradient>
        )
    }

    return (
        <View
            style={[
                {
                    borderRadius: Radius.card,
                    padding,
                    backgroundColor: Colors.surface,
                },
                variant === 'default' && Shadow.card,
                variant === 'outlined' && {
                    borderWidth: 1,
                    borderColor: Colors.border,
                },
                style,
            ]}
        >
            {children}
        </View>
    )
}
