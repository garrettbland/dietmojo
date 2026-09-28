import { Colors, Fonts, Radius } from '@/constants/theme'
import { forwardRef, useState } from 'react'
import { TextInput, TextInputProps, View } from 'react-native'
import { AppText } from './AppText'

type Props = TextInputProps & {
    label?: string
    suffix?: string
    error?: string
    size?: 'md' | 'lg'
}

/** Labeled input with brand focus/error states. */
export const TextField = forwardRef<TextInput, Props>(
    ({ label, suffix, error, size = 'md', style, ...rest }, ref) => {
        const [focused, setFocused] = useState(false)

        const borderColor = error
            ? Colors.danger
            : focused
              ? Colors.coral
              : Colors.border

        return (
            <View style={{ gap: 6 }}>
                {label && (
                    <AppText variant="label" color={Colors.gray700}>
                        {label}
                    </AppText>
                )}
                <View
                    style={{
                        flexDirection: 'row',
                        borderWidth: 1.5,
                        borderColor,
                        borderRadius: Radius.lg,
                        backgroundColor: Colors.white,
                        paddingHorizontal: 14,
                        ...(rest.multiline
                            ? {
                                  minHeight: 96,
                                  alignItems: 'flex-start',
                              }
                            : {
                                  height: size === 'lg' ? 64 : 50,
                                  alignItems: 'center',
                              }),
                    }}
                >
                    <TextInput
                        ref={ref}
                        placeholderTextColor={Colors.gray300}
                        selectionColor={Colors.coral}
                        maxFontSizeMultiplier={1.3}
                        {...rest}
                        onFocus={(e) => {
                            setFocused(true)
                            rest.onFocus?.(e)
                        }}
                        onBlur={(e) => {
                            setFocused(false)
                            rest.onBlur?.(e)
                        }}
                        style={[
                            {
                                flex: 1,
                                height: rest.multiline
                                    ? undefined
                                    : '100%',
                                textAlignVertical: rest.multiline
                                    ? 'top'
                                    : 'center',
                                fontFamily:
                                    size === 'lg'
                                        ? Fonts.bold
                                        : Fonts.body,
                                fontSize: size === 'lg' ? 28 : 16,
                                color: Colors.text,
                            },
                            style,
                        ]}
                    />
                    {suffix && (
                        <AppText
                            variant="caption"
                            color={Colors.gray500}
                            style={{ marginLeft: 6 }}
                        >
                            {suffix}
                        </AppText>
                    )}
                </View>
                {error && (
                    <AppText variant="caption" color={Colors.danger}>
                        {error}
                    </AppText>
                )}
            </View>
        )
    }
)
TextField.displayName = 'TextField'
