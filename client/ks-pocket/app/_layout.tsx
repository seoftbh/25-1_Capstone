/**
|--------------------------------------------------
| Root Layout
|--------------------------------------------------
*/

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import "react-native-reanimated";
import Toast, { BaseToast } from "react-native-toast-message";
import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "@/constants";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Toast 설정
const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: colors.GOLD_700,
        marginHorizontal: -32,
        marginVertical: 8,
        height: 64,
        width: "90%",
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 20,
        fontWeight: "600",
      }}
      text2Style={{
        fontSize: 13,
      }}
    />
  ),
};

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [userName, setUserName] = useState<string | null>(null);

  // supabase를 이용해 세션 정보 로드
  useEffect(() => {
    const getSession = async () => {
      try {
        // 현재 세션 가져오기
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("세션 정보 로드 실패:", error.message);
          return;
        }

        if (session) {
          // 사용자 프로필 정보 가져오기
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", session.user.id)
            .single();

          if (profileError) {
            console.error("프로필 정보 로드 실패:", profileError.message);
            return;
          }

          if (profileData) {
            setUserName(
              profileData.name || session.user.email?.split("@")[0] || "사용자"
            );
          }
        }
      } catch (error) {
        console.error("세션 처리 중 오류 발생:", error);
      }
    };

    getSession();
  }, []);

  // 사용자 이름이 로드되면 환영 메시지 표시
  useEffect(() => {
    if (userName) {
      Toast.show({
        type: "success",
        text1: `${userName}님, 반가워요!`,
        text2: "경성포켓",
        position: "top",
        visibilityTime: 3000,
      });
    }
  }, [userName]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <Toast config={toastConfig} />
    </>
  );
}
