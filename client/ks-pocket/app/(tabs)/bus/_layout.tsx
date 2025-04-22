/**
|--------------------------------------------------
| Bus Layout
|--------------------------------------------------
*/

import { Stack } from "expo-router";

export default function BusLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: {backgroundColor: "aliceblue"} }}>
      <Stack.Screen
        name="index"
        options={{ headerShown: false, title: "버스" }}
      />
    </Stack>
  );
}
