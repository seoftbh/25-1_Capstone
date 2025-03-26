import { colors } from "@/constants";
import { Tabs } from "expo-router";
import React, { useEffect } from "react";
import { BackHandler, Platform } from "react-native";
import CustomTabBar from "@/components/CustomTabBar";

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      {/* 내비게이션 순서: index가 첫 번째 */}
      <Tabs.Screen 
        name="index" 
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen 
        name="bus" 
        options={{
          title: "버스",
        }}
      />
      <Tabs.Screen 
        name="map" 
        options={{
          title: "지도",
        }}
      />
      <Tabs.Screen 
        name="board" 
        options={{
          title: "게시판",
        }}
      />
      <Tabs.Screen 
        name="more" 
        options={{
          title: "더보기",
        }}
      />
    </Tabs>
  );
}
