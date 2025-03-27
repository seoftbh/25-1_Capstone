import { colors } from "@/constants";
import React, { ForwardedRef, forwardRef } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

interface InputFieldProps extends TextInputProps {
  label?: string;
  variant?: "default" | "filled" | "outlined";
  error?: string;
}

function InputField(
  { label, variant = "filled", error = "", ...props }: InputFieldProps,
  ref: ForwardedRef<TextInput>
) {
  return (
    <View>
      {/* label이 있을 경우에만 Text 컴포넌트를 렌더링 */}
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.container,
          styles[variant],
          props.multiline && styles.multiLine,
          Boolean(error) && styles.inputError,
        ]}
      >
        <TextInput
          ref={ref}
          placeholderTextColor={colors.GRAY_500}
          style={[
            styles.input,
            props.multiline && styles.multiLineInput
          ]}
          autoCapitalize="none"
          spellCheck={false}
          autoCorrect={false}
          {...props}
        />
      </View>
      {/* error가 있을 경우에만 Text 컴포넌트를 렌더링 */}
      {Boolean(error) && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    marginBottom: 6,
    marginLeft: 4,
    color: colors.GRAY_700,
  },
  container: {
    backgroundColor: colors.WHITE,
    padding: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.GRAY_T200,
    justifyContent: "center",
    alignContent: "center",
    height: 52,
    flexDirection: "row",
    // marginBottom: 12,
  },
  filled: {
    backgroundColor: colors.GRAY_T100,
  },
  default: {},
  outlined: {},
  input: {
    fontSize: 16,
    color: colors.BLACK,
    padding: 0,
    flex: 1,
  },
  multiLineInput: {
    textAlignVertical: 'top',
    height: 'auto', // 컨테이너 높이에 맞게 조정 (200 - 패딩)
    paddingTop: 4, // 상단 패딩 추가
  },
  error: {
    fontSize: 12,
    marginTop: 2,
    marginLeft: 4,
    color: colors.RED_500,
  },
  inputError: {
    backgroundColor: colors.RED_100,
    borderColor: colors.RED_500,
  },
  multiLine: {
    alignItems: "flex-start",
    paddingVertical: 8,
    height: 200,
  },
});

export default forwardRef(InputField);
