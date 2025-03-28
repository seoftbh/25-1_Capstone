import CustomButton from "@/components/CustomButton";
import DescriptionInput from "@/components/DescriptionInput";
import TitleInput from "@/components/TitleInput";
import useCreatePost from "@/hooks/queries/useCreatePost";
import { useNavigation } from "expo-router";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Button, StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

type FormValues = {
  title: string;
  description: string;
  imageUris: string[];
};

export default function PostWriteScreen() {
  const navigation = useNavigation();
  const createPost = useCreatePost();

  const postForm = useForm<FormValues>({
    defaultValues: {
      title: "",
      description: "",
      // imageUris: [],
    },
  });

  const onSubmit = (formValues: FormValues) => {
    createPost.mutate(formValues);
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <CustomButton
          label="저장"
          onPress={postForm.handleSubmit(onSubmit)}
          size="md"
          variant="primary"
        />
      ),
    });
  }, [navigation, postForm.formState.isValid]);

  return (
    <KeyboardAwareScrollView style={styles.container}>
      <FormProvider {...postForm}>
        <TitleInput />
        <DescriptionInput />
      </FormProvider>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    gap: 16,
  },
});
