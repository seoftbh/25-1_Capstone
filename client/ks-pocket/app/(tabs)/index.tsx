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
      <View style={styles.topSection}>
        <Text style={commonStyles.h1}>즐거운 오후 되세요!</Text>
      </View>
      <View style={styles.middleSection}>

        <Pressable onPress={() => router.push("/assistant")}>
          <Text style={[commonStyles.h3, styles.assistantEntrance]}>궁금한 게 있나요?</Text>
          <InputField 
  placeholder="여기를 눌러 별이에게 물어보세요! ✨"
  onPress={() => router.push("/assistant")}
  editable={false} // 터치만 가능하게 입력은 비활성화
/>
        </Pressable>
      </View>
      <View style={styles.bottomSection}></View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    // alignItems: "center",
    backgroundColor: colors.GOLD_100,
  },
  topSection: {
    flex: 2,
    // justifyContent: "center",
    // alignItems: "center",
  },
  middleSection: {
    flex: 1,
    justifyContent: "center",
    // alignItems: "center",
  },
  bottomSection: {
    flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
  },
  assistantEntrance: {
    marginBottom: 24,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: colors.BROWN_800,
  },
})
