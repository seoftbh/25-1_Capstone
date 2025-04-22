import React from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import InputField from "./InputField";

function PasswordConfirmInput() {
  const { control } = useFormContext();
  const password = useWatch({ control, name: "password" });

  return (
    <Controller
      name="passwordConfirm"
      control={control}
      rules={{
        // 비밀번호 확인 유효성 검사
        validate: (data: string) => {
          if (data.length === 0) {
            return "비밀번호를 한 번 더 입력해 주세요. 확인을 위한 단계예요.";
          }
          if (data !== password) {
            return "비밀번호가 서로 달라요. 다시 확인해 주세요.";
          }
        },
      }}
      render={({ field: { ref, onChange, value }, fieldState: { error } }) => (
        <InputField
          ref={ref} // ref 속성을 InputField 컴포넌트로 전달
          label="비밀번호 확인"
          placeholder="비밀번호를 한 번 더 입력해 주세요."
          value={value}
          onChangeText={onChange}
          error={error?.message} // 에러 메시지가 있을 경우에만 출력
          secureTextEntry
          textContentType="oneTimeCode" // iOS에서 비밀번호 자동완성 기능 비활성화
          returnKeyType="done" // 키보드의 완료 버튼을 눌렀을 때 폼 제출
        />
      )}
    />
  );
}

export default PasswordConfirmInput;
