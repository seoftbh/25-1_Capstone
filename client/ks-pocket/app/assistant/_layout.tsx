/**
|--------------------------------------------------
| Assistant Layout
|--------------------------------------------------
*/

import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";

export default function AssistantLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "aliceblue" },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerTitle: "무엇이든 물어보세요! 🌟",
          headerLeft: () => (
            <Ionicons
              name="chevron-back"
              size={24}
              color={"black"}
              onPress={() =>
                router.canGoBack() ? router.back() : router.replace("/")
              }
              style={{
                marginRight: 8,
                marginTop: 4,
              }}
            />
          ),
        }}
      />
    </Stack>
  );
}
