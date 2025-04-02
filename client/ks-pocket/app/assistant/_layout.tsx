/**
|--------------------------------------------------
| Assistant Layout
|--------------------------------------------------
*/

import { Stack } from "expo-router";

export default function AssistantLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: {backgroundColor: "aliceblue"} }}>
      <Stack.Screen
        name="index"
        options={{ headerShown: false, title: "Assistant" }}
      />
    </Stack>
  );
}
