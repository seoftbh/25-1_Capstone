/**
|--------------------------------------------------
| Home Screen
|--------------------------------------------------
*/

import CustomButton from "@/components/CustomButton";
import FeedItem from "@/components/FeedItem";
import InputField from "@/components/InputField";
import { colors } from "@/constants";
import { commonStyles } from "@/constants/CommonStyles";
import { router } from "expo-router";
import { View, Text, SafeAreaView, Pressable, StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <SafeAreaView style={[commonStyles.safeArea, styles.container]}>
      <View>
        <Text style={commonStyles.h1}>Home Screen</Text>
        <Text>Hello, Wrold!</Text>
        <Pressable onPress={() => router.push("/bus")}>
          <Text>Go to screen 2</Text>
        </Pressable>
        <CustomButton
          label="버튼1"
          onPress={() => {
            router.push("/bus");
          }}
        />
        <InputField label="이메일" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
    backgroundColor: colors.WHITE,
  },
})
