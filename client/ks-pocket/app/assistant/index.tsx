/**
|--------------------------------------------------
| Assistant Screen
|--------------------------------------------------
*/

import React from "react";
import { StyleSheet, View, Text } from "react-native";

export default function AssistantScreen() {
  return (
    <View style={styles.container}>
      <Text>Assistant Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
  },
});
