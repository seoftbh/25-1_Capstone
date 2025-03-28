import { colors } from "@/constants";
import { Post } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Profile from "./FeedHeader";

interface FeedItemProps {
  post: Post;
}

function FeedItem({ post }: FeedItemProps) {
  const isLiked = false;
  return (
    <View style={styles.container}>
      {/* 피드 내용 **************************/}
      <View style={styles.contentContainer}>
        {/* 프로필 */}
        <Profile
          imageUri={post.author.imageUri}
          nickname={post.author.nickname}
          createdAt={post.createdAt}
          onPress={() => {}}
        />
        {/* 피드 제목 */}
        <Text style={styles.title}>{post.title}</Text>
        {/* 피드 내용 */}
        <Text numberOfLines={3} style={styles.desc}>
          {post.description}
        </Text>
      </View>

      {/* 메뉴 ******************************/}
      <View style={styles.menuContainer}>
        <Pressable style={styles.menu}>
          {/* 좋아요 */}
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={16}
            color={isLiked ? colors.RED_500 : colors.GRAY_500}
          />
          <Text style={isLiked ? styles.activeMenuText : styles.menuText}>
            1
          </Text>
        </Pressable>
        <Pressable style={styles.menu}>
          {/* 댓글 */}
          <Ionicons name="chatbox-outline" size={16} color={colors.GRAY_500} />
          <Text style={styles.menuText}>1</Text>
        </Pressable>
        <Pressable style={styles.menu}>
          {/* 조회수 */}
          <Ionicons name="eye-outline" size={16} color={colors.GRAY_500} />
          <Text style={styles.menuText}>1</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.WHITE,
    borderColor: colors.GRAY_300,
    borderWidth: 1,
    // borderWidth: StyleSheet.hairlineWidth,
    elevation: 1,
    borderRadius: 12,
  },
  contentContainer: {
    // padding: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    // backgroundColor: "pink",
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
