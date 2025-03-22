/**
|--------------------------------------------------
| More Layout
|--------------------------------------------------
*/

import { Stack } from "expo-router";

export default function MoreLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: {backgroundColor: "lightyellow"} }}>
      <Stack.Screen
        name="index"
        options={{ headerShown: false, title: "더보기" }}
      />
    </Stack>
  );
}
