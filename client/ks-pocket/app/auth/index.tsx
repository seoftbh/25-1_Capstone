import { Image, SafeAreaView, StyleSheet, Text, View } from "react-native";
import React from "react";
import CustomButton from "@/components/CustomButton";
import { commonStyles } from "@/constants/CommonStyles";
import { Link, router } from "expo-router";
import { colors } from "@/constants";

export default function AuthScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require("@/assets/images/ks-pocket-icon.png")}
          style={styles.logo}
        />
        <Text style={styles.l1}>내 손안의 캠퍼스</Text>
        <Text style={styles.l2}>경성포켓</Text>
      </View>
      <View style={styles.middleContainer}>
        <Text style={styles.l3}>지금 로그인하고</Text>
        <Text style={styles.l4}>편리한 캠퍼스 생활을 시작해 보아요</Text>
      </View>
      <View style={styles.buttonContainer}>
        <CustomButton
          label="로그인하기"
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
    // backgroundColor: colors.GOLD_100,
  },
  l1: {
    fontSize: 24,
    fontWeight: "bold",
    // marginBottom: 10,
  },
  l2: {
    fontSize: 36,
    fontWeight: "bold",
    // marginBottom: 64,
  },
  middleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  l3: {
    fontSize: 16,
    marginBottom: 8,
  },
  l4: {
    fontSize: 16,
    marginBottom: 10,
  },
  imageContainer: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    flex: 1.2,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 32,
  },
  signupText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
});
