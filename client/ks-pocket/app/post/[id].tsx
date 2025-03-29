/**
|--------------------------------------------------
| Post Detail Screen
|--------------------------------------------------
*/

import { getPostById, incrementViewCount } from "@/api/post";
import { getCommentsByPostId } from "@/api/comment";
import CommentItem from "@/components/CommentItem";
import FeedItem from "@/components/FeedItem";
import InputField from "@/components/InputField";
import { colors } from "@/constants";
import useCreateComment from "@/hooks/queries/useCreateComment";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useState, useEffect, useRef } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const postId =
    typeof id === "string" ? Number(id) : Array.isArray(id) ? Number(id[0]) : 0;
  const createComment = useCreateComment();
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();
  const hasIncrementedView = useRef(false);

  // 현재 게시물 ID를 캐시에 저장 (댓글 삭제 등에 활용)
  useEffect(() => {
    if (postId) {
      queryClient.setQueryData(["currentPostId"], postId);
    }
    
    return () => {
      // 컴포넌트 언마운트 시 데이터 정리
      queryClient.removeQueries({ queryKey: ["currentPostId"] });
    };
  }, [postId, queryClient]);

  // 페이지 방문 시 조회수 증가 (한 번만 실행)
  useEffect(() => {
    const incrementView = async () => {
      if (postId && !hasIncrementedView.current) {
        try {
          await incrementViewCount(postId);
          hasIncrementedView.current = true;
          
          // 게시물 데이터 갱신 (업데이트된 조회수 반영)
          setTimeout(() => {
            // 개별 게시물 쿼리 무효화
            queryClient.invalidateQueries({ queryKey: ["post", postId] });
            // 게시물 목록 쿼리도 함께 무효화 (중요!)
            queryClient.invalidateQueries({ queryKey: ["posts"] });
          }, 500); // 약간의 지연을 두고 데이터 갱신
        } catch (error) {
          console.error("조회수 증가 오류:", error);
        }
      }
    };

    incrementView();
  }, [postId, queryClient]);

  // 게시물 데이터 가져오기
  const { data: post, isLoading: postLoading } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId,
  });

  // 댓글 데이터 가져오기
  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => getCommentsByPostId(postId),
    enabled: !!postId,
  });

  const navigation = useNavigation();

  const handleSubmitComment = () => {
    if (!content.trim()) return;
    
    console.log("댓글 작성");
    const commentData = {
      id: String(Date.now()), // Generate a temporary ID
      post_id: postId,
      content: content,
    };
    
    createComment.mutate(commentData, {
      onSuccess: () => {
        setContent(""); // 댓글 작성 후 입력 필드 초기화
      }
    });
  };

  // 로딩 중 표시
  if (postLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.GOLD_700} />
        </View>
      </SafeAreaView>
    );
  }

  // 데이터가 없을 때 처리
  if (!post) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>게시물을 불러올 수 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView 
        contentContainerStyle={styles.scrollViewContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <FeedItem post={post} isDetail={true} />
          <Text style={styles.commentCount}>
            댓글 {post.comment_count || 0}개
          </Text>
          
          {/* 댓글 목록 */}
          <View style={styles.commentsList}>
            {commentsLoading ? (
              <ActivityIndicator size="small" color={colors.GOLD_700} style={styles.commentsLoading} />
            ) : comments && comments.length > 0 ? (
              comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))
            ) : (
              <Text style={styles.noCommentsText}>
                첫 댓글을 작성해보세요!
              </Text>
            )}
          </View>
        </View>
      </KeyboardAwareScrollView>
      
      <View style={styles.commentInputContainer}>
        <InputField
          value={content}
          onChangeText={(text) => setContent(text)}
          returnKeyType="send"
          onSubmitEditing={handleSubmitComment}
          placeholder="댓글로 이야기 나눠요!"
          rightChild={
            <Pressable 
              onPress={handleSubmitComment} 
              disabled={!content.trim()}
              style={({ pressed }) => [
                styles.sendButton,
                { opacity: pressed || !content.trim() ? 0.6 : 1 }
              ]}
            >
              <Ionicons
                name="send"
                size={24}
                color={content.trim() ? colors.GOLD_700 : colors.GRAY_500}
                style={styles.commentSendBtn}
              />
            </Pressable>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: colors.RED_500,
  },
  scrollViewContainer: {
    backgroundColor: colors.GRAY_200,
    paddingBottom: 80, // 입력창 높이만큼 여백 추가
  },
  commentCount: {
    fontSize: 16,
    color: colors.GRAY_500,
    padding: 16,
    backgroundColor: colors.WHITE,
    marginTop: 12,
  },
  commentsList: {
    paddingVertical: 8,
  },
  commentsLoading: {
    padding: 16,
  },
  noCommentsText: {
    textAlign: "center",
    padding: 16,
    color: colors.GRAY_500,
    fontStyle: "italic",
  },
  commentInputContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.WHITE,
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.GRAY_300,
    elevation: 1,
  },
  sendButton: {
    padding: 4,
  },
  commentSendBtn: {
    paddingVertical: 8,
    paddingHorizontal: 2,
    marginLeft: 8,
  },
});
