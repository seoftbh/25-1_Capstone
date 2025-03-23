import { Image, SafeAreaView, StyleSheet, Text, View } from "react-native";
import React from "react";
import CustomButton from "@/components/CustomButton";
import { commonStyles } from "@/constants/CommonStyles";
import { Link, router } from "expo-router";

export default function AuthScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require("@/assets/images/react-logo.png")}
          style={styles.logo}
        />
        <Text style={commonStyles.h1}>인증 화면</Text>
      </View>
      <View style={styles.buttonContainer}>
        <CustomButton
          label="로그인"
          onPress={() => {
            router.push("/auth/login");
          }}
        />
        <Link href={"/auth/signup"} style={styles.signupText}>
          회원가입
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "space-around",
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {},
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  signupText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
});
