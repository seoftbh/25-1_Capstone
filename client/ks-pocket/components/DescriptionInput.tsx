import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import InputField from "./InputField";

function DescriptionInput() {
  const { control } = useFormContext();

  return (
    <Controller
      name="description"
      control={control}
      rules={{
        validate: (data: string) => {
          // 이메일 유효성 검사
          if (data.length <= 5) {
            return "내용을 5자 이상 적어주세요.";
          }
        },
      }}
      render={({ field: { ref, onChange, value }, fieldState: { error } }) => (
        <InputField
          ref={ref} // ref 속성을 InputField 컴포넌트로 전달
          label="내용"
          placeholder="내용을 입력해 주세요."
          value={value}
          onChangeText={onChange}
          error={error?.message} // 에러 메시지가 있을 경우에만 출력
          returnKeyType="next" // 키보드의 다음 버튼을 눌렀을 때 다음 필드로 포커스 이동
          multiline // 여러 줄 입력 가능
        />
      )}
    />
  );
}

export default DescriptionInput;
