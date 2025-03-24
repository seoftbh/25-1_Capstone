/**
|--------------------------------------------------
| MoreScreen
|--------------------------------------------------
*/

import { View, Text, SafeAreaView } from "react-native";
import React, { useState, useEffect } from "react";
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";
import { commonStyles } from "@/constants/CommonStyles";
import ShortcutList from "@/components/ShortcutList";
import { supabase } from "@/lib/supabase";
import { Session } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

export default function MoreScreen() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // 현재 세션 가져오기
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 인증 상태 변경 이벤트 리스너 설정
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    // 컴포넌트 언마운트 시 이벤트 리스너 정리
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <Text style={commonStyles.h1}>내 정보</Text>
      
      {session && session.user ? (
        <View>
          <Text style={commonStyles.text}>
            {session.user.email}님 환영합니다
          </Text>
          <Text style={commonStyles.smallText}>
            사용자 ID: {session.user.id}
          </Text>
          <CustomButton
            label="로그아웃"
            onPress={async () => {
              await supabase.auth.signOut();
            }}
          />
        </View>
      ) : (
        <CustomButton
          label="로그인"
          onPress={() => {
            router.push("/auth");
          }}
        />
      )}
      
      <Text style={commonStyles.h1}>바로가기</Text>
      <ShortcutList />
    </SafeAreaView>
  );
}
