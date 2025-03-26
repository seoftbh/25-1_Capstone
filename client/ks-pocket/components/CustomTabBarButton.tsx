import { colors } from "@/constants";
import React from "react";
import { TouchableOpacity, Image, View, StyleSheet } from "react-native";

interface CustomTabBarButtonProps {
  onPress?: () => void;
}

export default function CustomTabBarButton({ onPress }: CustomTabBarButtonProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.button}>
        <Image
          source={require("../assets/images/sparkles_3d.png")}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    top: -16,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    width: 68,
    height: 68,
    borderRadius: 30,
    backgroundColor: colors.GOLD_200,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  image: {
    width: 40,
    height: 40,
  },
});