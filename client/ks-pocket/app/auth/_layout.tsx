import { colors } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { Link, Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{
      headerTintColor: colors.BLACK,
      contentStyle: {
        backgroundColor: colors.WHITE,
      },
    }}>
      <Stack.Screen
        name="index"
        options={{
          title: "로그인 및 회원가입",
          headerShown: true,
          headerLeft: () => (
            <Link href={"/"} replace style={{ marginLeft: 8, marginRight: 16 }}>
              <Ionicons name="home-sharp" size={24} color={"black"} />
            </Link>
          ),
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          title: "로그인",
          headerShown: true,
        }}
      />
    </Stack>
  );
}
