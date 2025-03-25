import FixedBottomCTA from "@/components/FixedBottomCTA";
import { Alert, StyleSheet, View } from "react-native";
import { FormProvider, useForm } from "react-hook-form";
import EmailInput from "@/components/EmailInput";
import PasswordInput from "@/components/PasswordInput";
import PasswordConfirmInput from "@/components/PasswordConfirmInput";
import { useState } from "react";
import { supabase } from "@/lib/supabase"; 
import { router } from "expo-router";
import NameInput from "@/components/NameInput";
import DeptInput from "@/components/DeptInput";

type FormValues = {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
  dept: string;
};

export default function SignupScreen() {
  const [loading, setLoading] = useState(false);
  
  const signupForm = useForm<FormValues>({
    // 기본값 설정
    defaultValues: {
      email: "",
      password: "",
      passwordConfirm: "",
      name: "",
      dept: "",
    },
  });

  async function signUpWithEmail(formValues: FormValues) {
    setLoading(true);
    
    // 응답 구조 변경: data 객체 전체를 가져옴
    const { data, error } = await supabase.auth.signUp({
      email: formValues.email,
      password: formValues.password,
      options: {
        data: {
          name: formValues.name,
          dept: formValues.dept
        }
      }
    });
    
    if (error) {
      Alert.alert("회원가입 오류", error.message);
      setLoading(false);
      return;
    }

    const { session, user } = data;
    console.log("회원가입 응답:", { session: !!session, user: !!user, userId: user?.id });
    
    // 사용자 ID 확인 (세션이 없어도 user는 있을 수 있음)
    const userId = user?.id;
    
    // 프로필 정보 저장 시도 (session이 아닌 userId 사용)
    if (userId) {
      try {
        console.log("프로필 저장 시도 (userId):", userId);
        
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            name: formValues.name,
            dept: formValues.dept,
            updated_at: new Date()
          });
          
        if (profileError) {
          console.error('프로필 정보 저장 오류:', profileError);
        } else {
          console.log("프로필 저장 성공!");
        }
      } catch (err) {
        console.error('프로필 저장 중 예외 발생:', err);
      }
    } else {
      console.warn("사용자 ID를 찾을 수 없어 프로필을 저장할 수 없습니다.");
    }

    setLoading(false);
    
    if (session) {
      // 이메일 인증이 필요 없거나 자동 로그인이 된 경우
      console.log("회원가입 후 자동 로그인됨:", session.user.id);
      router.replace("/auth");
    } else {
      // 이메일 인증이 필요한 경우
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
        <NameInput />
        <DeptInput />
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
