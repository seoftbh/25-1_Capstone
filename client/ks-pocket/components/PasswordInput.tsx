import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import InputField from "./InputField";
import { TextInputProps } from "react-native";

interface Props {
  submitBehavior?: TextInputProps["submitBehavior"];
  returnKeyType?: TextInputProps["returnKeyType"];
}

function PasswordInput({ submitBehavior = "blurAndSubmit", returnKeyType = "next" }: Props) {
  const { control, setFocus } = useFormContext();

  // console.log("PasswordInput props:", { submitBehavior, returnKeyType });

  return (
    <Controller
      name="password"
      control={control}
      rules={{
        // 비밀번호 유효성 검사
        validate: (data: string) => {
          if (data.length === 0) {
            return "비밀번호를 입력해 주세요.";
          }
          if (data.length < 8) {
            return "비밀번호는 8자 이상으로 입력해 주세요.";
          }
        },
      }}
      render={({ field: { ref, onChange, value }, fieldState: { error } }) => (
        <InputField
          ref={ref} // ref 속성을 InputField 컴포넌트로 전달
          label="비밀번호"
          placeholder="비밀번호를 입력해 주세요."
          value={value}
          error={error?.message} // 에러 메시지가 있을 경우에만 출력
          onChangeText={onChange}
          secureTextEntry
          textContentType="oneTimeCode" // iOS에서 비밀번호 자동완성 기능 비활성화
          onSubmitEditing={() => setFocus("passwordConfirm")} // 다음 필드로 포커스 이동
          // submitBehavior="submit" // 키보드가 닫히지 않고 폼 제출
          submitBehavior={submitBehavior} // 키보드 닫힘 여부 설정
          // returnKeyType="next" // 키보드의 다음 버튼을 눌렀을 때 다음 필드로 포커스 이동
          returnKeyType={returnKeyType} // 키보드의 다음 버튼 동작 설정
        />
      )}
    />
  );
}

export default PasswordInput;
