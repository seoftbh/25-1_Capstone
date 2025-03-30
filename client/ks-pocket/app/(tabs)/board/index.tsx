/**
|--------------------------------------------------
| Board Screen
|--------------------------------------------------
*/

import { View, Text, SafeAreaView, Pressable, StyleSheet } from "react-native";
import React, { useEffect } from "react";
import { commonStyles } from "@/constants/CommonStyles";
import FeedList from "@/components/FeedList";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants";
import { useAuthStore, debugAuthState, useInitializeAuth } from "@/api/auth";

export default function BoardScreen() {
  // 인증 초기화 커스텀 훅 사용
  useInitializeAuth();
  
  // zustand 스토어에서 인증 상태 가져오기
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  
  // 화면에 포커스될 때마다 인증 상태 디버깅
  useFocusEffect(
    React.useCallback(() => {
      console.log("Board screen focused, logged in:", isLoggedIn);
      debugAuthState();
      return () => {};
    }, [isLoggedIn])
  );
  
  return (
    <SafeAreaView style={[styles.container]}>
      <FeedList />
      
      {/* 디버깅 정보 표시 (개발 중에만 사용) */}
      {/*__DEV__ && (
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>
            로그인 상태: {isLoggedIn ? "로그인됨" : "로그아웃됨"}
          </Text>
        </View>
      )*/}
      
      {/* 로그인된 사용자에게만 글 추가 버튼 표시 */}
      {isLoggedIn && (
        <Pressable 
          style={styles.writeButton} 
          onPress={() => router.push("/post/write")}
        >
          <Ionicons name="add" size={36} color="white" />
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  writeButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: colors.GOLD_700,
    borderRadius: 50,
    width: 64,
    height: 64,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  debugInfo: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 5,
    borderRadius: 5,
  },
  debugText: {
    color: 'white',
    fontSize: 12,
  },
});
