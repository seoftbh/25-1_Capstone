/**
|--------------------------------------------------
| BoardLayout
|--------------------------------------------------
*/

import { Stack } from "expo-router";

export default function BoardLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: {backgroundColor: "aliceblue"} }}>
      <Stack.Screen
        name="index"
        options={{ headerShown: false, title: "게시판" }}
      />
    </Stack>
  );
}
