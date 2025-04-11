import { colors } from "@/constants";
import React, { ReactNode } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko"; // 한국어 로케일 추가
dayjs.extend(relativeTime);
dayjs.locale("ko");

interface FeedHeaderProps {
  onPress: () => void;
  nickname: string;
  dept?: string; // 학과 정보 추가
  imageUri?: string; // 이미지가 없을 수도 있으므로 선택적으로 설정
  createdAt: string;
  option?: ReactNode;
}

function FeedHeader({
  onPress,
  imageUri,
  nickname,
  dept,
  createdAt,
  option,
}: FeedHeaderProps) {
  return (
    <View style={styles.container}>
      <Pressable style={styles.profileContainer} onPress={onPress}>
        <Image
          source={
            imageUri
              ? { uri: imageUri }
              : require("@/assets/images/avatar-gray.png")
          }
          style={styles.image}
        />
        <View style={{ gap: 2 }}>
          <View style={styles.userInfoContainer}>
            <Text style={styles.nickname}>{nickname}</Text>
            {dept && <Text style={styles.dept}>{dept}</Text>}
          </View>
          <Text style={styles.createdat}>{dayjs(createdAt).fromNow()}</Text>
        </View>
      </Pressable>
      {option}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.GRAY_300,
    marginRight: 6,
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  nickname: {
    fontSize: 16,
    fontWeight: "bold",
  },
  dept: {
    fontSize: 14,
    color: colors.GRAY_700,
  },
  createdat: {
    fontSize: 14,
    color: colors.GRAY_500,
  },
});

export default FeedHeader;
