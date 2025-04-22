import { StyleSheet } from "react-native";

export const commonStyles = StyleSheet.create({
  h1: {
    fontSize: 24,
    fontWeight: "bold",
    color: "black",
    marginTop: 20,
  },
  h2: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
    marginTop: 20,
  },
  h3: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
    marginTop: 20,
  },
  text: {
    fontSize: 16,
    color: "black",
    marginVertical: 10,
  },
  smallText: {
    fontSize: 14,
    color: "black",
    marginVertical: 5,
  },
  p: {
    fontSize: 16,
    color: "black",
    marginVertical: 10,
  },
  centerText: {
    textAlign: "center",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  safeArea: {
    padding: 16,
  }
});
