/**
|--------------------------------------------------
| MoreScreen
|--------------------------------------------------
*/

import { View, Text, SafeAreaView, StyleSheet } from "react-native";
import React, { useState, useEffect } from "react";
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";
import { commonStyles } from "@/constants/CommonStyles";
import ShortcutList from "@/components/ShortcutList";
import { supabase } from "@/lib/supabase";
import { Session } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import { colors } from "@/constants";

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
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('프로필 조회 오류:', error);
        return;
      }
      
      setProfile(data as Profile);
    } catch (error) {
      console.error('프로필 조회 중 예외 발생:', error);
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // 컴포넌트 언마운트 시 이벤트 리스너 정리
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 메타데이터에서 이름과 부서 정보 가져오기
  const getUserMetadata = () => {
    if (!session?.user?.user_metadata) return { name: '알 수 없음', dept: '알 수 없음' };
    
    const { name, dept } = session.user.user_metadata;
    return { name: name || '알 수 없음', dept: dept || '알 수 없음' };
  };

  return (
    <SafeAreaView style={[commonStyles.safeArea, styles.container]}>
      <Text style={commonStyles.h1}>내 정보</Text>
      
      {loading ? (
        <Text style={commonStyles.text}>정보를 불러오는 중...</Text>
      ) : session && session.user ? (
        <View style={styles.profileContainer}>
          <Text style={commonStyles.h2}>
            {profile?.name || getUserMetadata().name}님 환영합니다
          </Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>이메일:</Text>
            <Text style={styles.infoValue}>{session.user.email}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>이름:</Text>
            <Text style={styles.infoValue}>{profile?.name || getUserMetadata().name}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>학과:</Text>
            <Text style={styles.infoValue}>{profile?.dept || getUserMetadata().dept}</Text>
          </View>
          
          <CustomButton
            label="로그아웃"
            onPress={async () => {
              await supabase.auth.signOut();
            }}
            style={styles.logoutButton}
          />
        </View>
      ) : (
        <View style={styles.profileContainer_notLoggedIn}>
          <Text style={styles.profileContainer_notLoggedIn_text}>로그인하고 더 많은 기능을 이용해 보세요!</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.GOLD_100,
    flex: 1,
  },
  profileContainer: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    marginVertical: 16,
  },
  profileContainer_notLoggedIn: {
    padding: 16,
    backgroundColor: colors.GOLD_200,
    borderRadius: 16,
    marginVertical: 16,
    alignItems: 'center',
  },
  profileContainer_notLoggedIn_text: {
    fontSize: 16,
    color: colors.BROWN_900,
    marginBottom: 16,
    paddingVertical: 16,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  infoLabel: {
    width: 80,
    fontWeight: '600',
    color: '#555',
  },
  infoValue: {
    flex: 1,
    color: '#333',
  },
  logoutButton: {
    marginTop: 16,
    backgroundColor: '#dc3545',
  },
  loginButton: {
    marginVertical: 16,
  },
  shortcutTitle: {
    marginTop: 16,
  }
});
