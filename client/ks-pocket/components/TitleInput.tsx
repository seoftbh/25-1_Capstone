import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import InputField from "./InputField";

function TitleInput() {
  const { control, setFocus } = useFormContext();

  return (
    <Controller
      name="title"
      control={control}
      rules={{
        validate: (data: string) => {
          if (data.length <= 0) {
            return "제목을 입력해 주세요.";
          }
        },
      }}
      render={({ field: { ref, onChange, value }, fieldState: { error } }) => (
        <InputField
          ref={ref} // ref 속성을 InputField 컴포넌트로 전달
          label="제목"
          placeholder="제목을 입력해 주세요."
          value={value}
          onChangeText={onChange}
          error={error?.message} // 에러 메시지가 있을 경우에만 출력
          returnKeyType="next" // 키보드의 다음 버튼을 눌렀을 때 다음 필드로 포커스 이동
          submitBehavior="submit" // 키보드가 닫히지 않고 폼 제출
          onSubmitEditing={() => setFocus("description")} // 다음 필드로 포커스 이동
          autoFocus // 화면이 렌더링될 때 자동으로 포커스
        />
      )}
    />
  );
}

export default TitleInput;
