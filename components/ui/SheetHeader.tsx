import { Colors, Spacing } from '@/constants/theme'
import { useRouter } from 'expo-router'
import { ReactNode } from 'react'
import { View } from 'react-native'
import { AppText } from './AppText'
import { IconButton } from './IconButton'

/**
 * Header row used at the top of modal screens: title on the left,
 * optional action(s) and a close button on the right.
 */
export const SheetHeader = ({
    title,
    subtitle,
    right,
    onClose,
}: {
    title: string
    subtitle?: string
    right?: ReactNode
    onClose?: () => void
}) => {
    const router = useRouter()
    return (
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: Spacing.lg,
                paddingTop: Spacing.lg,
                paddingBottom: Spacing.sm,
                gap: Spacing.sm,
            }}
        >
            <View style={{ flex: 1 }}>
                <AppText variant="h1" accessibilityRole="header">
                    {title}
                </AppText>
                {subtitle && (
                    <AppText variant="caption" color={Colors.gray500}>
                        {subtitle}
                    </AppText>
                )}
            </View>
            <View
                style={{
                    flexDirection: 'row',
                    gap: Spacing.xs,
                    alignItems: 'center',
                }}
            >
                {right}
                <IconButton
                    icon="close"
                    accessibilityLabel="Close"
                    background={Colors.gray50}
                    size={38}
                    onPress={onClose ?? (() => router.back())}
                />
            </View>
        </View>
    )
}
