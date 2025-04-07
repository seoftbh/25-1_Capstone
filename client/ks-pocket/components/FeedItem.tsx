import { colors } from "@/constants";
import { Post } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import FeedHeader from "./FeedHeader";
import { useActionSheet } from "@expo/react-native-action-sheet";
import useDeletePost from "@/hooks/queries/useDeletePost";
import { router } from "expo-router";
import { useAuthStore } from "@/api/auth";
import { supabase } from "@/lib/supabase";

interface FeedItemProps {
  post: Post;
  isDetail?: boolean;
}

function FeedItem({ post, isDetail = false }: FeedItemProps) {
  const isLiked = false;
  const { showActionSheetWithOptions } = useActionSheet();
  const deletePost = useDeletePost();
  const currentUser = useAuthStore(state => state.user);
  
  // 작성자 ID와 현재 사용자 ID 일치 여부 확인
  const isAuthor = post.userId === currentUser?.id;

  // isDetail 속성에 따라 다른 스타일을 적용
const containerStyle = [
  styles.container,
  isDetail ? styles.detailContainer : null
];

  const handlePressOption = () => {
    const options = ["삭제", "수정", "취소"];
    const cancelButtonIndex = 2;
    const destructiveButtonIndex = 0;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      (selectedIndex?: number) => {
        switch (selectedIndex) {
          case destructiveButtonIndex:
            // 삭제 처리
            console.log("삭제");
            deletePost.mutate(post.id, {
              onSuccess: () => {
                isDetail && router.back();
              }, // 삭제 후 상세 페이지에서 뒤로가기
            });
            break;
          case 1:
            // 수정 처리
            console.log("수정");
            router.push({
              pathname: "/post/update/[id]",
              params: { id: post.id },
            });
            break;
          default:
            // 취소 처리
            console.log("취소");
            break;
        }
      }
    );
  };

  const handlePressFeed = () => {
    console.log("피드 눌림");
    if (!isDetail) {
      // 피드 상세 페이지가 아닐 때만 이동
      router.push(`/post/${post.id}`);
    }
  };

  const ContainerComponent = isDetail ? View : Pressable; // 상세 페이지가 아닐 때만 Pressable로 설정

  return (
    <ContainerComponent style={isDetail? styles.detailContainer : styles.container} onPress={handlePressFeed}>
      {/* 피드 내용 **************************/}
      <View style={styles.contentContainer}>
        {/* 프로필 */}
        <FeedHeader
          imageUri={post.author?.imageUri}
          nickname={post.name || post.author?.nickname}
          dept={post.dept}
          createdAt={post.createdAt}
          onPress={() => {}}
          option={
            // 작성자만 옵션 버튼 표시
            isAuthor ? (
              <Pressable
                onPress={() => {
                  handlePressOption();
                }}
              >
                <Ionicons
                  name="ellipsis-horizontal"
                  size={20}
                  color={colors.GRAY_500}
                />
              </Pressable>
            ) : null
          }
        />
        {/* 피드 제목 */}
        <Text style={styles.title}>{post.title}</Text>
        {/* 피드 내용 */}
        <Text numberOfLines={3} style={styles.desc}>
          {post.description}
        </Text>
        {/* 조회수 및 댓글 수 */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={16} color={colors.GRAY_500} />
            <Text style={styles.statText}>
              {post.viewCount || post.viewCount || 0}
            </Text>
          </View>
          <View style={styles.statItem}>
            {/* <Ionicons name="chatbubble-outline" size={16} color={colors.GRAY_500} /> */}
            <Ionicons name="chatbox-outline" size={16} color={colors.GRAY_500} />
            <Text style={styles.statText}>
              {post.comment_count || post.comment_count || 0}
            </Text>
          </View>
        </View>
      </View>

      {/* 메뉴 ******************************/}
      {/* <View style={styles.menuContainer}> */}
        {/* <Pressable style={styles.menu}> */}
          {/* 좋아요 */}
          {/* <Ionicons */}
            {/* name={isLiked ? "heart" : "heart-outline"} */}
            {/* size={16} */}
            {/* color={isLiked ? colors.RED_500 : colors.GRAY_500} */}
          {/* /> */}
          {/* <Text style={isLiked ? styles.activeMenuText : styles.menuText}> */}
            {/* {post.likes || 0} */}
          {/* </Text> */}
        {/* </Pressable> */}
        {/* <Pressable style={styles.menu}> */}
          {/* 댓글 */}
          {/* <Ionicons name="chatbox-outline" size={16} color={colors.GRAY_500} /> */}
          {/* <Text style={styles.menuText}> */}
            {/* {post.comment_count || post.comment_count || 0} */}
          {/* </Text> */}
        {/* </Pressable> */}
        {/* <Pressable style={styles.menu}> */}
          {/* 조회수 */}
          {/* <Ionicons name="eye-outline" size={16} color={colors.GRAY_500} /> */}
          {/* <Text style={styles.menuText}> */}
            {/* {post.viewCount || post.viewCount || 0} */}
          {/* </Text> */}
        {/* </Pressable> */}
      {/* </View> */}
    </ContainerComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.WHITE,
    // borderColor: colors.GRAY_300,
    borderColor: colors.BROWN_200,
    borderWidth: 3,
    // borderWidth: StyleSheet.hairlineWidth,
    // elevation: 2,
    borderRadius: 16,
  },
  detailContainer: {
    backgroundColor: colors.WHITE,
    borderColor: colors.GRAY_300,
    // borderWidth: 1,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 1,
    // borderRadius: 12,
  },
  contentContainer: {
    // padding: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    // backgroundColor: "pink",
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    marginLeft: 4,
    fontSize: 14,
    color: colors.GRAY_500,
  },
  menuContainer: {
    // backgroundColor: "lightblue",
    backgroundColor: colors.GRAY_T100,
    borderBottomStartRadius: 12,
    borderBottomEndRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    // marginTop: 12,
    borderTopColor: colors.GRAY_300,
    borderTopWidth: StyleSheet.hairlineWidth,
    // borderRadius: 8,
  },
  menu: {
    flexDirection: "row",
    // flex: 1,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "33.333%",
    gap: 4,
  },
  menuText: {
    fontSize: 14,
    color: colors.GRAY_500,
  },
  activeMenuText: {
    fontWeight: "600",
    color: colors.RED_500,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.BLACK,
    marginVertical: 10,
  },
  desc: {
    fontSize: 16,
    color: colors.BLACK,
    marginBottom: 4,
  },
});

export default FeedItem;
