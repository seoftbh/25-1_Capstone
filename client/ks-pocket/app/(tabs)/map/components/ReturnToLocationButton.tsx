import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

type ReturnToLocationButtonProps = {
  onPress: () => void;
};

const ReturnToLocationButton: React.FC<ReturnToLocationButtonProps> = ({
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.returnButton}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.buttonText}>기본 위치로 돌아가기</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  returnButton: {
    position: "absolute",
    top: 65, // 카테고리 버튼 아래에 위치하도록 조정
    alignSelf: "center",
    backgroundColor: "#3366FF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default ReturnToLocationButton;
