/**
|--------------------------------------------------
| FeedList Component
|--------------------------------------------------
*/

import React, { useEffect } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View, RefreshControl } from "react-native";
import FeedItem from "./FeedItem";
import { useFocusEffect } from "expo-router";
import { colors } from "@/constants";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import useGetInfinitePosts from "@/hooks/queries/useGetInfinitePosts";

export default function FeedList() {
  const queryClient = useQueryClient();

  // useGetInfinitePosts 훅 사용으로 변경
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
    isRefetching
  } = useGetInfinitePosts();

  // 화면에 포커스될 때마다 데이터 새로고침
  useFocusEffect(
    React.useCallback(() => {
      refetch();
      return () => {};
    }, [refetch])
  );

  // Supabase 실시간 업데이트 구독 (기존 코드 유지)
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

  // 추가: 스크롤이 끝에 도달했을 때 다음 페이지 로드
  const handleEndReached = () => {
    console.log("스크롤 끝에 도달", { hasNextPage, isFetchingNextPage });
    if (hasNextPage && !isFetchingNextPage) {
      console.log("다음 페이지 로드 시도");
      fetchNextPage();
    }
  };

  // 모든 페이지의 포스트를 하나의 배열로 합치기
  const posts = data?.pages?.flatMap(page => page) || [];

  // 디버깅을 위한 로그 추가
  useEffect(() => {
    if (data) {
      console.log("총 페이지 수:", data.pages.length);
      console.log("총 게시물 수:", posts.length);
    }
  }, [data, posts.length]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.BROWN_500} />
        <Text style={styles.loadingText}>게시물을 불러오는 중...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>데이터를 불러오는데 실패했습니다.</Text>
        <Text style={styles.retryText} onPress={() => refetch()}>
          다시 시도하기
        </Text>
      </View>
    );
  }

  if (!posts.length) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>게시물이 없습니다.</Text>
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
          refreshing={isRefetching}
          onRefresh={refetch}
          colors={[colors.BROWN_500]}
        />
      }
      // 추가: 무한 스크롤 구현을 위한 속성
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage ? (
          <View style={styles.footerLoader}>
            <ActivityIndicator color={colors.BROWN_500} />
            <Text style={styles.footerText}>불러오는 중...</Text>
          </View>
        ) : null
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
    height: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  footerLoader: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.GRAY_500,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: colors.GRAY_500,
  },
  errorText: {
    fontSize: 16,
    color: colors.RED_500,
    marginBottom: 8,
  },
  retryText: {
    fontSize: 16,
    color: colors.BROWN_500,
    textDecorationLine: "underline",
  },
  emptyText: {
    fontSize: 16,
    color: colors.GRAY_500,
  },
});
