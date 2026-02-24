import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export const ModalNavbar = ({ title }: { title: string }) => {
  const router = useRouter();

  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 15,
      }}
    >
      <Text>{title}</Text>

      <TouchableOpacity onPress={() => router.dismiss()}>
        <SimpleLineIcons name="close" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
};
