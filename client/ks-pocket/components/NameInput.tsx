import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import InputField from "./InputField";

function NameInput() {
  const { control, setFocus } = useFormContext();
  
  return (
    <Controller
      name="name"
      control={control}
      rules={{
        validate: (data: string) => {
          if (data.length === 0) {
            return "이름을 입력해 주세요.";
          }
        },
      }}
      render={({ field: { ref, onChange, value }, fieldState: { error } }) => (
        <InputField
          ref={ref}
          label="이름"
          placeholder="이름을 입력해 주세요."
          value={value}
          error={error?.message}
          onChangeText={onChange}
          onSubmitEditing={() => setFocus("dept")}
          returnKeyType="next"
          autoFocus // 화면이 렌더링될 때 자동으로 포커스
        />
      )}
    />
  );
}

export default NameInput;