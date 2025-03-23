import { colors } from "@/constants";
import React, { ReactNode } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

interface ProfileProps {
  onPress: () => void;
  nickname: string;
  imageUri?: string; // 이미지가 없을 수도 있으므로 선택적으로 설정
  createdAt: string;
  option?: ReactNode;
}

function Profile({
  onPress,
  imageUri,
  nickname,
  createdAt,
  option,
}: ProfileProps) {
  return (
    <View style={styles.container}>
      <Pressable style={styles.profileContainer} onPress={onPress}>
        <Image
          source={
            imageUri
              ? { uri: imageUri }
              : require("@/assets/images/react-logo.png")
          }
          style={styles.image}
        />
        <View style={{ gap: 2 }}>
          <Text style={styles.nickname}>{nickname}</Text>
          <Text style={styles.createdat}>{createdAt}</Text>
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
  nickname: {
    fontSize: 16,
    fontWeight: "bold",
  },
  createdat: {
    fontSize: 14,
    color: colors.GRAY_500,
  },
});

export default Profile;
