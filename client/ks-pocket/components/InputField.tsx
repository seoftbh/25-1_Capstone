import { colors } from "@/constants";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

interface InputFieldProps extends TextInputProps {
  label: string;
  variant?: "default" | "filled" | "outlined";
}

function InputField({ label, variant = "filled", ...props }: InputFieldProps) {
  return (
    <View>
      {/* label이 있을 경우에만 Text 컴포넌트를 렌더링 */}
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.container, styles[variant]]}>
        <TextInput placeholderTextColor={colors.GRAY_500} style={styles.input} {...props} />
      </View>
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
});

export default InputField;
