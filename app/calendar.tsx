// import { Link } from "expo-router";
import { useDate } from "@/providers/DateProvider";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker, {
  DateType,
  useDefaultStyles,
} from "react-native-ui-datepicker";

// import { ThemedText } from '@/components/themed-text';
// import { ThemedView } from '@/components/themed-view';

export default function Calendar() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const defaultStyles = useDefaultStyles();
  const { date, setDate } = useDate();

  const handleDateSelect = (newDate: DateType) => {
    setDate(newDate as Date);
    router.dismiss();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "blue" }}>
      {/* Nav */}
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "red",
        }}
      >
        <Text>History</Text>
        <Text onPress={() => router.dismiss()}>X</Text>
      </View>

      {/* Legend */}
      <View>
        <Text>✅ Successful day, 📝 has entries</Text>
      </View>

      {/* Calendar view */}
      <View>
        <DateTimePicker
          mode="single"
          date={date}
          onChange={({ date: newDate }) => handleDateSelect(newDate)}
          styles={defaultStyles}
        />
      </View>
    </View>
  );
}
