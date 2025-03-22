import { colors } from "@/constants";
import { Tabs } from "expo-router";
import React from "react";
import {
  Ionicons as IonIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import CustomTabBarButton from "@/components/CustomTabBarButton";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.GOLD_700,
        headerShown: false,
        tabBarStyle: {
          height: 68,
          borderTopWidth: 0,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="bus"
        options={{
          title: "버스",
          tabBarIcon: ({ color, focused }) => (
            <IonIcons
              name={focused ? "bus" : "bus-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "지도",
          tabBarIcon: ({ color, focused }) => (
            <IonIcons
              name={focused ? "map" : "map-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: () => null,
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="board"
        options={{
          title: "게시판",
          tabBarIcon: ({ color, focused }) => (
            <IonIcons
              name={focused ? "create" : "create-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "더보기",
          tabBarIcon: ({ color, focused }) => (
            <IonIcons
              name={
                focused
                  ? "ellipsis-horizontal-circle-sharp"
                  : "ellipsis-horizontal-circle"
              }
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
