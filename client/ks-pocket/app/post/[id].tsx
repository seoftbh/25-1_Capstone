/**
|--------------------------------------------------
| Post Detail Screen
|--------------------------------------------------
*/

import { getPostById } from "@/api/post";
import FeedItem from "@/components/FeedItem";
import InputField from "@/components/InputField";
import { colors } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const postId =
    typeof id === "string" ? Number(id) : Array.isArray(id) ? Number(id[0]) : 0;

  const { data: post, isLoading } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId,
  });

  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
          <View>
            {post && <FeedItem post={post} isDetail={true} />}
            <Text style={styles.commentCount}>댓글 {post?.commentCount}개</Text>
          </View>
        </ScrollView>
        <View style={styles.commentInputContainer}>
          {/* 댓글 작성 및 목록 컴포넌트 추가 */}
          <InputField placeholder="댓글을 작성하세요..." rightChild={
            <Pressable onPress={() => console.log("댓글 작성")}>
                <Ionicons name="send" size={24} color={colors.BROWN_500} style={styles.commentSendBtn} />
            </Pressable>
          } />
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  scrollViewContainer: {
    backgroundColor: colors.GRAY_200,
  },
  commentCount: {
    fontSize: 16,
    color: colors.GRAY_500,
    padding: 16,
    backgroundColor: colors.WHITE,
    marginTop: 12,
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
  commentSendBtn: {
    paddingVertical: 8,
    paddingHorizontal: 2,
    marginLeft: 8,
    },
});
