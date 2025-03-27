/**
|--------------------------------------------------
| Board Screen
|--------------------------------------------------
*/

import { View, Text, SafeAreaView, Pressable, StyleSheet } from "react-native";
import React from "react";
import { commonStyles } from "@/constants/CommonStyles";
import FeedList from "@/components/FeedList";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants";

export default function BoardScreen() {
  return (
    <SafeAreaView style={[commonStyles.safeArea, styles.container]}>
      <FeedList />
      <Pressable style={styles.writeButton} onPress={() => router.push("/post/write")}>
        <Ionicons name="add" size={36} color="white" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5", // Light gray background
  },
  writeButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: colors.GOLD_700, // Tomato color
    borderRadius: 50,
    width: 64,
    height: 64,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5, // Add shadow for Android
    shadowColor: "#000", // Shadow color for iOS
    shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
    shadowOpacity: 0.3, // Shadow opacity for iOS
    shadowRadius: 4, // Shadow radius for iOS
  },
});
