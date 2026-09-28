import { Colors } from '@/constants/theme'
import { ReactNode } from 'react'
import { Text, View } from 'react-native'
import { AppText } from './AppText'

export const EmptyState = ({
    emoji,
    title,
    message,
    action,
}: {
    emoji: string
    title: string
    message?: string
    action?: ReactNode
}) => (
    <View
        style={{
            alignItems: 'center',
            paddingVertical: 36,
            paddingHorizontal: 24,
            gap: 6,
        }}
    >
        <View
            style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: Colors.orangeTint,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8,
            }}
        >
            <Text style={{ fontSize: 34 }}>{emoji}</Text>
        </View>
        <AppText variant="h3" align="center">
            {title}
        </AppText>
        {message && (
            <AppText
                variant="body"
                color={Colors.gray500}
                align="center"
            >
                {message}
            </AppText>
        )}
        {action && <View style={{ marginTop: 12 }}>{action}</View>}
    </View>
)
