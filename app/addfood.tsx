// import { Link } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { addFoodEntry } from "@/lib/addFood";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

// import { ThemedText } from '@/components/themed-text';
// import { ThemedView } from '@/components/themed-view';

export default function AddFood() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  /**
   * tempPhotoUri is the uri of the photo taken in the TakePhoto screen.
   * We use local search params to pass it back to this screen without saving it
   * to the db first. If the user confirms adding the food, then we can save the photo
   * permanently and save the new uri in the db along with the food entry.
   */
  const { tempPhotoUri } = useLocalSearchParams();
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    if (tempPhotoUri) {
      setPreviewUri(tempPhotoUri as string);
    }
  }, [tempPhotoUri]);

  const handleAddFood = async () => {
    const { message } = await addFoodEntry({
      photoUri: previewUri ?? undefined,
      name: "Pizza",
      calories: 300,
      protein: 10,
      carbs: 30,
      fat: 15,
    });

    if (message === "SUCCESS") {
      router.dismiss();
    } else {
      Alert.alert("Error", "Failed to add food entry. Please try again.");
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={handleAddFood}
          style={{
            height: 36, // somethiing about a height and width of 36 centers
            width: 36,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* <IconSymbol size={26} name="xmark" color={"black"} /> */}
          <IconSymbol size={26} name="checkmark" color={"black"} />
        </Pressable>
      ),
    });
  }, [navigation]);

  /**
   * Grabbed this from the expo docs. Does it even work?
   * https://docs.expo.dev/versions/latest/sdk/image/#usage
   */
  const blurhash =
    "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

  const handleChooseImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0,
      allowsMultipleSelection: false,
    });

    if (!result.canceled) {
      setPreviewUri(result.assets[0].uri);
    } else {
      alert("You did not select any image.");
    }
  };

  return (
    <ScrollView
      keyboardShouldPersistTaps="always"
      style={{ flex: 1 }}
      contentContainerStyle={{ marginTop: insets.top }}
    >
      <SafeAreaView style={{ padding: 15 }}>
        {/* Take photo or choose photo component */}
        <View style={{ backgroundColor: "orange" }}>
          <Text>Photo is optional</Text>
          <View style={{ display: "flex", flexDirection: "row" }}>
            <Pressable
              style={{ width: "50%", height: 150, backgroundColor: "gray" }}
              onPress={() => {
                router.navigate("/takephoto");
              }}
            >
              {!previewUri && <Text>Take Photo</Text>}
              {previewUri && (
                <Image
                  source={{ uri: previewUri }}
                  placeholder={{ blurhash }}
                  contentFit="cover"
                  transition={500}
                  style={{ width: "100%", height: "100%" }}
                />
              )}
            </Pressable>
            <Pressable
              onPress={handleChooseImage}
              style={{ width: "50%", height: 150 }}
            >
              <Text>Choose Photo</Text>
            </Pressable>
          </View>
        </View>

        {/* Food name */}
        <View style={{ backgroundColor: "red" }}>
          <Text>Food name</Text>
          <TextInput
            style={{ height: 40, borderColor: "gray", borderWidth: 1 }}
            onChangeText={() => {}}
            placeholder="What did you eat?"
            returnKeyType="done"
          />
        </View>

        {/* Optional macros inputs */}
        <View>
          <Text>Add Macros (Optional)</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            <View style={{ width: "50%", paddingRight: 5 }}>
              <Text>Calories</Text>
              <TextInput
                style={{ height: 40, borderColor: "gray", borderWidth: 1 }}
                onChangeText={() => {}}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>

            {/* Protein */}
            <View style={{ width: "50%", paddingLeft: 5 }}>
              <Text>Protein (grams)</Text>
              <TextInput
                style={{ height: 40, borderColor: "gray", borderWidth: 1 }}
                onChangeText={() => {}}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>

            {/* Carbs */}
            <View style={{ width: "50%", paddingRight: 5 }}>
              <Text>Carbs (grams)</Text>
              <TextInput
                style={{ height: 40, borderColor: "gray", borderWidth: 1 }}
                onChangeText={() => {}}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>

            {/* Fat */}
            <View style={{ width: "50%", paddingRight: 5 }}>
              <Text>Fat (grams)</Text>
              <TextInput
                style={{ height: 40, borderColor: "gray", borderWidth: 1 }}
                onChangeText={() => {}}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Date info */}
        <Text>Logging for date/date/date</Text>
      </SafeAreaView>
    </ScrollView>
  );
}
