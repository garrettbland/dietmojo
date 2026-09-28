import { Colors, Fonts, Radius } from '@/constants/theme'
import { parseLocal, toDayKey } from '@/lib/date'
import { haptic } from '@/lib/haptics'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Text, View } from 'react-native'
import DateTimePicker, {
    CalendarDay,
    DateType,
} from 'react-native-ui-datepicker'

/**
 * The picker types a day's `date` as a string, but at runtime it hands
 * back a dayjs object (and sometimes a Date). Normalise all three.
 */
export const toLocalDate = (value: unknown): Date | null => {
    let asDate: Date
    if (value instanceof Date) {
        asDate = value
    } else if (typeof value === 'string') {
        asDate = parseLocal(value.replace(' ', 'T'))
    } else if (
        typeof (value as { toDate?: () => Date })?.toDate ===
        'function'
    ) {
        asDate = (value as { toDate: () => Date }).toDate()
    } else if (typeof value === 'number') {
        asDate = new Date(value)
    } else {
        return null
    }
    return Number.isNaN(asDate.getTime()) ? null : asDate
}

const dayKeyOf = (value: CalendarDay['date']): string => {
    const d = toLocalDate(value as unknown)
    return d ? toDayKey(d) : ''
}

const pickerStyles = {
    header: { paddingVertical: 8 },
    month_selector_label: {
        fontFamily: Fonts.bold,
        fontSize: 18,
        color: Colors.text,
    },
    year_selector_label: {
        fontFamily: Fonts.bold,
        fontSize: 18,
        color: Colors.coral,
    },
    weekday_label: {
        fontFamily: Fonts.bold,
        fontSize: 12,
        color: Colors.gray500,
    },
    month_label: { fontFamily: Fonts.semiBold },
    year_label: { fontFamily: Fonts.semiBold },
    selected_month: {
        backgroundColor: Colors.coral,
        borderRadius: Radius.full,
    },
    selected_month_label: { color: Colors.white },
    selected_year: {
        backgroundColor: Colors.coral,
        borderRadius: Radius.full,
    },
    selected_year_label: { color: Colors.white },
}

/**
 * Brand-styled month calendar — dates only. Days in `markedDays` get a
 * dot. Shared by the History screen and the day picker sheet.
 */
export const MonthCalendar = ({
    value,
    onSelect,
    markedDays,
}: {
    value: Date
    onSelect: (date: Date) => void
    markedDays?: Set<string>
}) => {
    const select = (raw: DateType) => {
        const d = toLocalDate(raw as unknown)
        if (!d) return
        haptic.selection()
        onSelect(d)
    }

    const Day = (day: CalendarDay) => {
        const marked = markedDays?.has(dayKeyOf(day.date)) ?? false
        return (
            <View
                style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: day.isSelected
                        ? Colors.coral
                        : 'transparent',
                    borderWidth:
                        day.isToday && !day.isSelected ? 1.5 : 0,
                    borderColor: Colors.coral,
                    opacity: day.isDisabled
                        ? 0.3
                        : day.isCurrentMonth
                          ? 1
                          : 0.4,
                }}
            >
                <Text
                    style={{
                        fontFamily: day.isSelected
                            ? Fonts.extraBold
                            : Fonts.semiBold,
                        fontSize: 15,
                        color: day.isSelected
                            ? Colors.white
                            : Colors.text,
                    }}
                >
                    {day.text}
                </Text>
                <View
                    style={{
                        position: 'absolute',
                        bottom: 4,
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: marked
                            ? day.isSelected
                                ? Colors.white
                                : Colors.orange
                            : 'transparent',
                    }}
                />
            </View>
        )
    }

    return (
        <DateTimePicker
            mode="single"
            date={value}
            maxDate={new Date()}
            onChange={({ date: d }) => select(d)}
            components={{
                Day,
                IconPrev: (
                    <Ionicons
                        name="chevron-back"
                        size={22}
                        color={Colors.gray700}
                    />
                ),
                IconNext: (
                    <Ionicons
                        name="chevron-forward"
                        size={22}
                        color={Colors.gray700}
                    />
                ),
            }}
            styles={pickerStyles}
        />
    )
}
