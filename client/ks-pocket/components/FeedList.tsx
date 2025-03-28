/**
|--------------------------------------------------
| FeedList Component
|--------------------------------------------------
*/

import React, { useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View, RefreshControl } from "react-native";
import FeedItem from "./FeedItem";
import { colors } from "@/constants";
import useGetInfinitePosts from "@/hooks/queries/useGetInfinitePosts";
import { Post } from "@/types";

// 게시글은 10개씩 가져오고, 스크롤 시 다음 페이지를 가져오는 방식으로 구현

function FeedList() {
  const { 
    data: posts, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading,
    isError,
    refetch,
    isRefetching
  } = useGetInfinitePosts();

  const [refreshing, setRefreshing] = useState(false);
  
  // 새로고침 함수 수정
  const handleRefresh = async () => {
    setRefreshing(true);
    
    try {
      await refetch();
    } finally {
      // 새로고침 상태 초기화
      setRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.GOLD_700} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Text>오류가 발생했습니다. 다시 시도해주세요.</Text>
      </View>
    );
  }

  const flattenedData = posts?.pages.flat() || [];

  return (
    <FlatList
      data={flattenedData}
      renderItem={({ item }) => <FeedItem post={item} />}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={styles.contentContainer}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl
          refreshing={refreshing} // isRefetching 대신 로컬 상태 사용
          onRefresh={handleRefresh}
          colors={[colors.GOLD_700]}
          tintColor={colors.GOLD_700}
        />
      }
      ListFooterComponent={
        isFetchingNextPage ? (
          <View style={styles.footer}>
            <ActivityIndicator size="large" color={colors.GOLD_700} />
          </View>
        ) : null
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text>게시글이 없습니다.</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    gap: 12,
    paddingBottom: 72,
    // backgroundColor: 'pink',
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  }
});

export default FeedList;
