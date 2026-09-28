import { Colors, Radius } from '@/constants/theme'
import { formatTime } from '@/lib/date'
import { haptic } from '@/lib/haptics'
import DateTimePicker, {
    DateTimePickerAndroid,
} from '@react-native-community/datetimepicker'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Platform, Pressable, View } from 'react-native'
import { AppText } from './ui/AppText'

/**
 * The system time picker.
 *
 * iOS gets the inline spinner wheels; Android opens its own clock
 * dialog from a tappable row, which is that platform's convention.
 */
export const TimeField = ({
    value,
    onChange,
    maximumDate,
}: {
    value: Date
    onChange: (date: Date) => void
    maximumDate?: Date
}) => {
    if (Platform.OS === 'ios') {
        return (
            <View style={{ alignItems: 'center' }}>
                <DateTimePicker
                    value={value}
                    mode="time"
                    display="spinner"
                    maximumDate={maximumDate}
                    themeVariant="light"
                    accentColor={Colors.coral}
                    style={{ width: '100%', height: 190 }}
                    onChange={(_, date) => {
                        if (date) onChange(date)
                    }}
                />
            </View>
        )
    }

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Time, ${formatTime(value)}`}
            onPress={() => {
                haptic.light()
                DateTimePickerAndroid.open({
                    value,
                    mode: 'time',
                    is24Hour: false,
                    onChange: (_, date) => {
                        if (date) onChange(date)
                    },
                })
            }}
            style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderWidth: 1.5,
                borderColor: Colors.border,
                borderRadius: Radius.lg,
                backgroundColor: pressed
                    ? Colors.gray50
                    : Colors.white,
                paddingHorizontal: 16,
                height: 50,
            })}
        >
            <AppText variant="bodyStrong">
                {formatTime(value)}
            </AppText>
            <Ionicons
                name="time-outline"
                size={18}
                color={Colors.coral}
            />
        </Pressable>
    )
}
