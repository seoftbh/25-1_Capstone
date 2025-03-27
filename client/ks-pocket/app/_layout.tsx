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
import { useNavigation, useSegments } from "expo-router";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// 새로운 키 정의 - 로그인 상태 추적용
const LOGIN_STATE_KEY = "just_logged_in";

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
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const segments = useSegments();

  // 로그인 상태 확인 및 토스트 표시 로직
  useEffect(() => {
    const checkLoginState = async () => {
      try {
        // 현재 세션 가져오기
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          return;
        }
        
        // 방금 로그인했는지 확인
        const justLoggedIn = await AsyncStorage.getItem(LOGIN_STATE_KEY);
        
        if (justLoggedIn === 'true') {
          // 로그인 상태 초기화 (한 번만 표시하기 위해)
          await AsyncStorage.removeItem(LOGIN_STATE_KEY);
          
          // 사용자 프로필 정보 가져오기
          const { data: profileData } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", session.user.id)
            .single();
          
          if (profileData) {
            const name = profileData.name || session.user.email?.split("@")[0] || "사용자";
            
            // 토스트 메시지 표시 (약간의 지연 추가)
            setTimeout(() => {
              Toast.show({
                type: "success",
                text1: `${name}님, 반가워요!`,
                text2: "경성포켓",
                position: "top",
                visibilityTime: 3000,
              });
            }, 300);
          }
        }
      } catch (error) {
        console.error("로그인 상태 확인 중 오류:", error);
      }
    };
    
    // segments가 변경되어 홈 화면으로 이동했을 때만 체크
    if (segments[0] === '(tabs)') {
      checkLoginState();
    }
  }, [segments]);

  // 기존의 세션 로드 로직은 유지
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
