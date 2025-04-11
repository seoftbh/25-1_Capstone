import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants";

interface FixedBottomCTAProps {
  label: string;
  onPress: () => void;
  disabled?: boolean; // disabled prop 추가
}

export default function FixedBottomCTA({ 
  label, 
  onPress, 
  disabled = false // 기본값은 false
}: FixedBottomCTAProps) {
  const inset = useSafeAreaInsets(); // iOS에서 SafeAreaView의 안쪽 여백을 구함
  return (
    <View style={[styles.container, { paddingBottom: inset.bottom || 16 }]}>
      <TouchableOpacity
        style={[
          styles.button,
          disabled && styles.disabledButton // disabled 상태일 때 스타일 추가
        ]}
        onPress={onPress}
        disabled={disabled} // TouchableOpacity에 disabled 속성 전달
        activeOpacity={disabled ? 1 : 0.7} // 비활성화 상태일 때 탭 효과 제거
      >
        <Text style={[
          styles.label,
          disabled && styles.disabledLabel // disabled 상태일 때 텍스트 스타일 변경
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
    paddingBottom: 34, // iOS 하단 안전 영역 고려 (필요시 더 추가)
    borderTopWidth: 1,
    borderColor: '#eaeaea',
  },
  button: {
    backgroundColor: colors.GOLD_700,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC', // 비활성화 시 회색으로 변경
    // 혹은 투명도 조정: opacity: 0.5,
  },
  label: {
    color: colors.BROWN_800,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledLabel: {
    color: '#888888', // 비활성화 텍스트는 더 어둡게
  },
});
