import React from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomButton from "./CustomButton";
import { colors } from "@/constants";

interface FixedBottomCTAProps {
  label: string;
  onPress: () => void;
}

function FixedBottomCTA({ label, onPress }: FixedBottomCTAProps) {
  const inset = useSafeAreaInsets(); // iOS에서 SafeAreaView의 안쪽 여백을 구함
  return (
    <View style={[styles.fixed, { paddingBottom: inset.bottom || 16 }]}>
      <CustomButton label={label} onPress={onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  fixed: {
    position: "absolute",
    bottom: 0,
    padding: 16,
    width: "100%",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.GRAY_300,
  },
});

export default FixedBottomCTA;
