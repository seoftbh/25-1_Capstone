import { colors } from "@/constants";
import React from "react";
import {
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface CustomButtonProps extends PressableProps {
  label: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary";
}

function CustomButton({
  label,
  size = "lg",
  variant = "primary",
  ...props
}: CustomButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        styles[size],
        styles[variant],
        pressed && styles.pressed,
      ]}
      {...props}
    >
      <Text style={styles[variant]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  lg: {
    width: "100%",
    height: 48,
    paddingHorizontal: 20,
  },
  md: {
    height: 40,
    paddingHorizontal: 15,
  },
  sm: {
    height: 30,
    paddingHorizontal: 10,
  },
  primary: {
    backgroundColor: colors.GOLD_700,
    fontSize: 16,
    fontWeight: "bold",
    color: colors.BROWN_800,
  },
  secondary: {
    backgroundColor: colors.BROWN_500,
    fontSize: 16,
    fontWeight: "bold",
    color: colors.WHITE,
  },
  pressed: {
    opacity: 0.8,
  },
});

export default CustomButton;
