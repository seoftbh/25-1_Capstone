/**
|--------------------------------------------------
| FeedList Component
|--------------------------------------------------
*/

import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View, RefreshControl } from "react-native";
import FeedItem from "./FeedItem";
import { getPosts } from "@/api/post";
import { useFocusEffect } from "expo-router";
import { colors } from "@/constants";
import { supabase } from "@/lib/supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function FeedList() {
  const queryClient = useQueryClient();

  // 게시물 데이터 쿼리
  const {
    data: posts,
    isLoading,
    refetch,
    isError,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: () => getPosts(),
  });

  // 화면에 포커스될 때마다 데이터 새로고침
  useFocusEffect(
    React.useCallback(() => {
      refetch();
      return () => {};
    }, [refetch])
  );

  // Supabase 실시간 업데이트 구독 (선택 사항)
  useEffect(() => {
    // 게시물 테이블 변경 구독
    const subscription = supabase
      .channel("public:posts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
        },
        (payload) => {
          // 변경 발생 시 데이터 새로고침
          queryClient.invalidateQueries({ queryKey: ["posts"] });
        }
      )
      .subscribe();

    return () => {
      // 컴포넌트 언마운트 시 구독 해제
      subscription.unsubscribe();
    };
  }, [queryClient]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text>로딩 중...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Text>데이터를 불러오는데 실패했습니다.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      renderItem={({ item }) => <FeedItem post={item} />}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refetch}
          colors={[colors.GOLD_700]}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    paddingBottom: 80, // 하단 버튼을 가리지 않도록 패딩 추가
  },
  separator: {
    height: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
