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
        <Pressable onPress={() => router.push("/assistant")}>
          <Text>Go to Assistant</Text>
          <InputField 
  label="이메일" 
  placeholder="터치하면 어시스턴트 화면으로 이동합니다"
  onPress={() => router.push("/assistant")}
  editable={false} // 터치만 가능하게 입력은 비활성화
/>
        </Pressable>
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
