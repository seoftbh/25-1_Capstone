import FixedBottomCTA from "@/components/FixedBottomCTA";
import { Alert, StyleSheet, View } from "react-native";
import { FormProvider, useForm } from "react-hook-form";
import EmailInput from "@/components/EmailInput";
import PasswordInput from "@/components/PasswordInput";
import { useState } from "react";
import { supabase } from "@/lib/supabase"; // supabase 클라이언트 임포트 필요
import { router } from "expo-router";

type FormValues = {
  email: string;
  password: string;
};

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);

  const loginForm = useForm<FormValues>({
    // 기본값 설정
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function signInWithEmail(formValues: FormValues) {
    setLoading(true);
    const {
      error,
      data: { session },
    } = await supabase.auth.signInWithPassword({
      email: formValues.email,
      password: formValues.password,
    });
    if (error) Alert.alert("로그인 오류", error.message);
    setLoading(false);

    // 로그인 성공 시 홈 화면으로 이동
    if (session) {
      console.log("로그인 성공:", session);
      router.replace("/");
    }

    const onSubmit = async (formValues: FormValues) => {
      await signInWithEmail(formValues);
    };

    return (
      <FormProvider {...loginForm}>
        <View style={styles.container}>
          {/* 이메일, 비밀번호 입력 폼 */}
          <EmailInput />
          <PasswordInput returnKeyType="done" />
        </View>
        <FixedBottomCTA
          label="로그인"
          onPress={() => {
            loginForm.handleSubmit(onSubmit)();
          }}
          disabled={loading}
        />
      </FormProvider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 16,
    gap: 12,
  },
});
