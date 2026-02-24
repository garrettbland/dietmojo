import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Weight = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [number, onChangeNumber] = useState("");

  const inputRef = useRef<TextInput>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
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
          <Text>Log Weight</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Text onPress={() => router.dismiss()}>X</Text>
          </View>
        </View>

        {/* Date info */}
        <Text>Logging for date/date/date</Text>

        {/* Weight input */}
        <TextInput
          ref={inputRef}
          style={{ height: 40, borderColor: "gray", borderWidth: 1 }}
          onChangeText={onChangeNumber}
          value={number}
          placeholder="useless placeholder"
          keyboardType="numeric"
        />
      </ScrollView>

      {/* Submit Button */}
      <View
        style={{
          // position: "absolute",
          bottom: 0,
          right: 0,
          width: "100%",
          marginBottom: insets.bottom + 50,
          height: 50,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "green",
        }}
      >
        <Text onPress={() => router.dismiss()}>Save Weight</Text>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Weight;
