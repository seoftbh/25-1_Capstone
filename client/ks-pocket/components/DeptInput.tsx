import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import InputField from "./InputField";

function DeptInput() {
  const { control, setFocus } = useFormContext();
  
  return (
    <Controller
      name="dept"
      control={control}
      rules={{
        validate: (data: string) => {
          if (data.length === 0) {
            return "학과를 입력해 주세요.";
          }
        },
      }}
      render={({ field: { ref, onChange, value }, fieldState: { error } }) => (
        <InputField
          ref={ref}
          label="학과"
          placeholder="학과를 입력해 주세요."
          value={value}
          error={error?.message}
          onChangeText={onChange}
          onSubmitEditing={() => setFocus("email")}
          returnKeyType="next"
        />
      )}
    />
  );
}

export default DeptInput;