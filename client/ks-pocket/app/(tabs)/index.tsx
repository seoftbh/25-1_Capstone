/**
|--------------------------------------------------
| Home Screen
|--------------------------------------------------
*/

import CustomButton from "@/components/CustomButton";
import FeedItem from "@/components/FeedItem";
import InputField from "@/components/InputField";
import TimeBasedGreeting from "@/components/TimeBasedGreeting";
import WeatherWidget from "@/components/WeatherWidget";
import { colors } from "@/constants";
import { commonStyles } from "@/constants/CommonStyles";
import { router } from "expo-router";
import { View, Text, SafeAreaView, Pressable, StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <SafeAreaView style={[commonStyles.safeArea, styles.container]}>
      <View style={styles.topSection}>
        {/* <Text style={commonStyles.h1}>즐거운 오후 되세요!</Text> */}
        <TimeBasedGreeting />
        <WeatherWidget />
      </View>
      <View style={styles.middleSection}>
        <Pressable onPress={() => router.push("/assistant")}>
          <Text style={[styles.assistantEntrance]}>
            궁금한 게 있나요?
          </Text>
          <View style={styles.assistantButton}>
            <Text style={styles.assistantButtonText}>여기를 눌러 별이에게 물어보세요! ✨</Text>
          </View>
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
    // paddingHorizontal: 24,
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
    marginBottom: 18,
    textAlign: "center",
    fontSize: 28,
    fontWeight: "bold",
    color: colors.BROWN_800,
  },
  assistantButton: {
    backgroundColor: colors.BROWN_500,
    borderRadius: 32,
    // padding: 8,
    paddingVertical: 16,
    marginBottom: 32,
    marginHorizontal: 8,
    borderColor: colors.BROWN_500,
    borderWidth: 3,
    // elevation: 2,
    // shadowColor: colors.GRAY_300,
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.3,
    // shadowRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  assistantButtonText: {
    fontSize: 18,
    fontWeight: "400", 
    color: colors.WHITE,
    textAlign: "center",
    lineHeight: 24,
  },
});
