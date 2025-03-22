/**
|--------------------------------------------------
| Home Screen
|--------------------------------------------------
*/

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { router } from "expo-router";
import { View, Text, SafeAreaView, Pressable } from "react-native";

export default function HomeScreen() {
  return (
    <SafeAreaView>
      <View>
        <Text>Hello, Wrold!</Text>
        <Pressable onPress={() => router.push("/bus")}>
          <Text>Go to screen 2</Text>
        </Pressable>
        <CustomButton label="버튼1" onPress={() => {router.push("/bus")}} />
        <InputField label="이메일" />

      </View>
    </SafeAreaView>
  );
}
