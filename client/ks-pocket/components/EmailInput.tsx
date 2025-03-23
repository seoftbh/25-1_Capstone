import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import InputField from "./InputField";

function EmailInput() {
  const { control, setFocus } = useFormContext();

  return (
    <Controller
      name="email"
      control={control}
      rules={{
        validate: (data: string) => {
          // 이메일 유효성 검사
          if (data.length === 0) {
            return "이메일 주소를 입력해 주세요.";
          }
          if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(data)) {
            // 정규식 검사 - 이메일 형식 - https://regexr.com/3e48o
            return "이메일 주소를 다시 확인해주세요."; // 이메일 형식이 올바르지 않습니다.
          }
        },
      }}
      render={({ field: { ref, onChange, value }, fieldState: { error } }) => (
        <InputField
          ref={ref} // ref 속성을 InputField 컴포넌트로 전달
          label="이메일"
          placeholder="이메일 주소를 입력해 주세요."
          value={value}
          onChangeText={onChange}
          error={error?.message} // 에러 메시지가 있을 경우에만 출력
          inputMode="email"
          returnKeyType="next" // 키보드의 다음 버튼을 눌렀을 때 다음 필드로 포커스 이동
          submitBehavior="submit" // 키보드가 닫히지 않고 폼 제출
          onSubmitEditing={() => setFocus("password")} // 다음 필드로 포커스 이동
          autoFocus // 화면이 렌더링될 때 자동으로 포커스
        />
      )}
    />
  );
}

export default EmailInput;
