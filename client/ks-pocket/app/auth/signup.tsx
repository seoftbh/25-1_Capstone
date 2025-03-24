import FixedBottomCTA from "@/components/FixedBottomCTA";
import { Alert, StyleSheet, View } from "react-native";
import { FormProvider, useForm } from "react-hook-form";
import EmailInput from "@/components/EmailInput";
import PasswordInput from "@/components/PasswordInput";
import PasswordConfirmInput from "@/components/PasswordConfirmInput";
import { useState } from "react";
import { supabase } from "@/lib/supabase"; // supabase 클라이언트 임포트 필요
import { router } from "expo-router";

type FormValues = {
  email: string;
  password: string;
  passwordConfirm: string;
};

export default function SignupScreen() {
  const [loading, setLoading] = useState(false);
  
  const signupForm = useForm<FormValues>({
    // 기본값 설정
    defaultValues: {
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });

  async function signUpWithEmail(formValues: FormValues) {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: formValues.email,
      password: formValues.password,
    });
    
    if (error) {
      Alert.alert("회원가입 오류", error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    
    if (session) {
      console.log("회원가입 성공:", session);
      router.replace("/auth");
    } else {
      // 이메일 인증이 필요한 경우, 확인 버튼을 누르면 /auth로 이동
      Alert.alert(
        "이메일 확인", 
        "이메일 인증을 위해 메일함을 확인해주세요!", 
        [
          { 
            text: "확인", 
            onPress: () => router.replace("/auth") 
          }
        ]
      );
    }
  }

  const onSubmit = async (formValues: FormValues) => {
    // 비밀번호 일치 여부 확인
    if (formValues.password !== formValues.passwordConfirm) {
      Alert.alert("비밀번호 오류", "비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    
    // 회원가입 진행
    await signUpWithEmail(formValues);
  };

  return (
    <FormProvider {...signupForm}>
      <View style={styles.container}>
        {/* 이메일, 비밀번호 입력 폼 */}
        <EmailInput />
        <PasswordInput submitBehavior="submit" />
        <PasswordConfirmInput />
      </View>
      <FixedBottomCTA
        label={loading ? "처리 중..." : "회원가입"}
        disabled={loading}
        onPress={() => {
          signupForm.handleSubmit(onSubmit)();
        }}
      />
    </FormProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 16,
    gap: 12,
  },
});
