import FixedBottomCTA from "@/components/FixedBottomCTA";
import { StyleSheet, View } from "react-native";
import { FormProvider, useForm } from "react-hook-form";
import EmailInput from "@/components/EmailInput";
import PasswordInput from "@/components/PasswordInput";

type FormValues = {
  email: string;
  password: string;
  passwordConfirm: string;
};

export default function LoginScreen() {
  const loginForm = useForm<FormValues>({
    // 기본값 설정
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (formValues: FormValues) => {
    // console.log("formValues", formValues);
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
