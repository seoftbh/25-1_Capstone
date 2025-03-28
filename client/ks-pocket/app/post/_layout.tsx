import { colors } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { Link, Stack } from "expo-router";

export default function PostLayout() {
  return (
    <Stack screenOptions={{
      headerTintColor: colors.BLACK,
      contentStyle: {
        backgroundColor: colors.WHITE,
      },
    }}>
      <Stack.Screen
        name="write"
        options={{
          title: "글쓰기",
          headerShown: true,
          headerLeft: () => (
            <Link href={"/board"} replace>
              <Ionicons name="chevron-back" size={24} color={"black"} />
            </Link>
          ),
        }}
      />
    </Stack>
  );
}
