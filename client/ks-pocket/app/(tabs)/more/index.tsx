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
import ShortcutList from "@/components/ShortcutList";

export default function MoreScreen() {
  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <Text style={commonStyles.h1}>내 정보</Text>
      <CustomButton
        label="로그인"
        onPress={() => {
          router.push("/auth");
        }}
      />
      <Text style={commonStyles.h1}>바로가기</Text>
      <ShortcutList />
    </SafeAreaView>
  );
}
