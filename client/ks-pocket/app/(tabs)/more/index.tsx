/**
|--------------------------------------------------
| MoreScreen
|--------------------------------------------------
*/

import { View, Text, SafeAreaView } from "react-native";
import React from "react";
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";
import { commonStyles } from "@/constants/CommonStyles";

export default function MoreScreen() {
  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <Text>더보기</Text>
      <CustomButton
        label="로그인"
        onPress={() => {
          router.push("/auth");
        }}
      />
    </SafeAreaView>
  );
}
