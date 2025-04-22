/**
|--------------------------------------------------
| 
|--------------------------------------------------
*/

import { Stack } from "expo-router";

export default function MapLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: {backgroundColor: "aliceblue"} }}>
      <Stack.Screen
        name="index"
        options={{ headerShown: false, title: "지도" }}
      />
    </Stack>
  );
}
