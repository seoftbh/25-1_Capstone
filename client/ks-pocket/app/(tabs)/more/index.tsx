/**
|--------------------------------------------------
| MoreScreen
|--------------------------------------------------
*/

import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ImageBackground,
  ScrollView,
} from "react-native";
import React, { useState, useEffect } from "react";
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";
import { commonStyles } from "@/constants/CommonStyles";
import ShortcutList from "@/components/ShortcutList";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";
import { colors } from "@/constants";
import { Ionicons } from "@expo/vector-icons";

// 사용자 프로필 타입 정의
type Profile = {
  id: string;
  name: string;
  dept: string;
  updated_at: string;
};

export default function MoreScreen() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // 프로필 정보 가져오기
  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("프로필 조회 오류:", error);
        return;
      }

      setProfile(data as Profile);
    } catch (error) {
      console.error("프로필 조회 중 예외 발생:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // 현재 세션 가져오기
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);

      // 세션이 있으면 프로필 정보 가져오기
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 인증 상태 변경 이벤트 리스너 설정
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);

      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    // 컴포넌트 언마운트 시 이벤트 리스너 정리
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 메타데이터에서 이름과 부서 정보 가져오기
  const getUserMetadata = () => {
    if (!session?.user?.user_metadata)
      return { name: "알 수 없음", dept: "알 수 없음" };

    const { name, dept } = session.user.user_metadata;
    return { name: name || "알 수 없음", dept: dept || "알 수 없음" };
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={[styles.container]}>
          <Text style={commonStyles.h1}>내 정보</Text>

          {loading ? (
            <Text style={commonStyles.text}>정보를 불러오는 중...</Text>
          ) : session && session.user ? (
            <View style={styles.profileContainer}>
              <ImageBackground
                source={require("@/assets/images/profile-logo-bg.png")}
                resizeMode="cover"
                style={styles.profileInnerContainer}
                imageStyle={styles.backgroundImage}
              >
                <View style={styles.contentOverlay}>
                  <View style={styles.logoContainer}>
                    <ImageBackground
                      source={require("@/assets/images/ksu-logo.png")}
                      style={styles.logo}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.profileDept}>
                    {profile?.dept || getUserMetadata().dept}
                  </Text>
                  <Text style={styles.profileName}>
                    {profile?.name || getUserMetadata().name}
                  </Text>

                  <View style={styles.infoRow}>
                    {/* <Text style={styles.infoLabel}>이메일:</Text> */}
                    <Ionicons
                      name="mail-outline"
                      size={22}
                      color={colors.WHITE}
                      style={{ marginRight: 8, paddingVertical: 1 }}
                    />
                    <Text style={styles.infoValue}>{session.user.email}</Text>
                  </View>
                </View>
              </ImageBackground>
              <CustomButton
                label="로그아웃"
                onPress={async () => {
                  await supabase.auth.signOut();
                }}
                // style={styles.logoutButton}
              />
            </View>
          ) : (
            <View style={styles.profileContainer_notLoggedIn}>
              <Text style={styles.profileContainer_notLoggedIn_text}>
                로그인하고 더 많은 기능을 이용해 보세요!
              </Text>
              <CustomButton
                label="로그인"
                onPress={() => {
                  router.push("/auth");
                }}
                // style={styles.loginButton}
              />
            </View>
          )}

          <Text style={[commonStyles.h1, styles.shortcutTitle]}>바로가기</Text>
          <ShortcutList />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.GOLD_100,
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  profileContainer: {
    marginVertical: 16,
    // padding: 16,
    // backgroundColor: colors.BLUE_500,
    borderRadius: 16,
    // marginVertical: 16,
  },
  profileInnerContainer: {
    backgroundColor: colors.BLUE_500,
    // padding: 16,
    borderRadius: 16,
    elevation: 2,
    // overflow: 'hidden',
    marginBottom: 12,
    // height: '52%'
  },
  logoContainer: {
    alignSelf: "flex-start", // 왼쪽 정렬을 위해 추가
    marginBottom: 28,
    paddingLeft: 2,
  },
  logo: {
    height: 50, // 너비만 지정
    aspectRatio: 2.77, // 로고 이미지의 가로/세로 비율 (예: 100/36 ≈ 2.77)
    alignSelf: "flex-start", // 왼쪽 정렬
    // height 속성은 제거 (aspectRatio가 자동으로 계산)
  },
  profileContainer_notLoggedIn: {
    padding: 16,
    backgroundColor: colors.GOLD_200,
    borderRadius: 16,
    marginVertical: 16,
    alignItems: "center",
  },
  profileContainer_notLoggedIn_text: {
    fontSize: 18,
    color: colors.BROWN_900,
    marginBottom: 16,
    paddingVertical: 16,
    fontWeight: "bold",
  },
  profileDept: {
    fontSize: 24,
    fontWeight: "400",
    color: colors.WHITE,
    marginLeft: 6,
    // marginVertical: 8,
  },
  profileName: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.WHITE,
    marginBottom: 8,
    marginLeft: 4,
  },
  infoRow: {
    flexDirection: "row",
    marginVertical: 4,
    marginLeft: 4,
  },
  infoLabel: {
    width: 80,
    fontSize: 16,
    fontWeight: "600",
    color: colors.WHITE,
  },
  infoValue: {
    flex: 1,
    color: colors.WHITE,
    fontSize: 16,
    fontWeight: "400",
  },
  logoutButton: {
    marginTop: 16,
    backgroundColor: "#dc3545",
  },
  loginButton: {
    marginVertical: 16,
  },
  shortcutTitle: {
    marginVertical: 16,
  },
  backgroundImage: {
    // margin: 16,
    borderRadius: 16,
    opacity: 0.5,
    height: "100%",
    width: "100%",
  },
  contentOverlay: {
    // backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 16,
    width: "100%", // 내용이 배경 위에 적절히 배치되도록 설정
  },
});
