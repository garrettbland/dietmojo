import { SimpleDayNavigator } from "@/components/SimpleDayNavigator";
import { IconSymbol } from "@/components/ui/icon-symbol";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const App = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <SafeAreaView
          style={{
            flex: 1,
            padding: 15,
          }}
        >
          {/* Navbar */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Title */}
            <View>
              <Text style={{ fontSize: 30, fontWeight: "500" }}>Diet Mojo</Text>
              <Text>Track your meals</Text>
            </View>

            {/* Links */}
            <View
              style={{ flexDirection: "row", gap: 10, alignItems: "center" }}
            >
              {/* <Pressable onPress={() => router.navigate("/progress")}>
                <Ionicons name="scale" size={24} color="black" />
              </Pressable> */}
              <Pressable onPress={() => router.navigate("/settings")}>
                <Ionicons name="settings" size={24} color="black" />
              </Pressable>
              {/* <Pressable onPress={() => router.navigate("/calendar")}>
                  <IconSymbol size={26} name="calendar" color={"black"} />
                </Pressable> */}
            </View>
          </View>

          {/* Streaks */}
          <View style={{ flexDirection: "row", marginTop: 40 }}>
            <View
              style={{
                width: "50%",
                paddingRight: 5,
              }}
            >
              <View style={{ backgroundColor: "lightgray", padding: 10 }}>
                <Text>Current Streak</Text>
                <Text>🔥 5 Day Streak</Text>
              </View>
            </View>
            <View
              style={{
                width: "50%",
                paddingLeft: 5,
              }}
            >
              <View style={{ backgroundColor: "teal", padding: 10 }}>
                <Text>Current Streak</Text>
                <Text>🔥 5 Day Streak</Text>
              </View>
            </View>
          </View>

          <SimpleDayNavigator />

          {/* Optioanl weight marked complete component */}
          <View>
            <Text>Optional weight component</Text>
          </View>

          {/* Meals */}
          <View>
            <Text>Meals list </Text>
          </View>
        </SafeAreaView>
      </ScrollView>
      {/* Add meal button */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: "100%",
          marginBottom: insets.bottom + 10,
          height: 50,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "row",
          paddingHorizontal: 15,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Pressable
            onPress={() => router.navigate("/progress")}
            style={{ backgroundColor: "blue", padding: 10, borderRadius: 50 }}
          >
            <Ionicons name="scale" size={24} color="black" />
          </Pressable>
          <Pressable
            onPress={() => router.navigate("/calendar")}
            style={{ backgroundColor: "blue", padding: 10, borderRadius: 50 }}
          >
            <IconSymbol size={26} name="calendar" color={"black"} />
          </Pressable>
        </View>
        <Pressable
          onPress={() => router.navigate("/addfood")}
          style={{
            backgroundColor: "green",
            padding: 15,
            borderRadius: 50,
          }}
        >
          <Text style={{ color: "white" }}>Add Meal</Text>
        </Pressable>
      </View>
    </>
  );
};

export default App;
