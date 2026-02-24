import { useDate } from "@/providers/DateProvider";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

export const SimpleDayNavigator = () => {
  // const [selectedDate, setSelectedDate] = useState(new Date());

  const { date, setDate } = useDate();

  const previousDay = () => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - 1);
    setDate(newDate);

    // setDate((prev) => {
    //   const newDate = new Date(prev);
    //   newDate.setDate(newDate.getDate() - 1);
    //   return newDate;
    // });
  };

  const nextDay = () => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1);
    setDate(newDate);
    // setDate((prev) => {
    //   const newDate = new Date(prev);
    //   newDate.setDate(newDate.getDate() + 1);
    //   return newDate;
    // });
  };

  return (
    <View
      style={{
        flexDirection: "row",
        marginTop: 40,
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: "60%",
          paddingRight: 5,
        }}
      >
        <View
          style={{
            padding: 10,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Pressable onPress={previousDay}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </Pressable>
          <Text style={{}}>{date.toDateString()}</Text>
          <Pressable onPress={nextDay}>
            <Ionicons name="chevron-forward" size={24} color="black" />
          </Pressable>
        </View>
      </View>
      <View
        style={{
          width: "40%",
          paddingLeft: 5,
        }}
      >
        <View>
          <Pressable
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
              borderRadius: 40,
              borderColor: "black",
              borderWidth: 1,
              paddingVertical: 5,
              paddingHorizontal: 10,
            }}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={24}
              color="black"
              style={{ marginLeft: -4 }}
            />
            <Text style={{ paddingRight: 4 }}>Mark Success</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};
