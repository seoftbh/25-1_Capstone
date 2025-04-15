import { getPostById } from "@/api/post";
import CustomButton from "@/components/CustomButton";
import DescriptionInput from "@/components/DescriptionInput";
import TitleInput from "@/components/TitleInput";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { StyleSheet, View, Text } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useQuery } from "@tanstack/react-query";
import useUpdatePost from "@/hooks/queries/useUpdatePost";

type FormValues = {
  title: string;
  description: string;
  imageUris: string[];
};

export default function PostUpdateScreen() {
  const { id } = useLocalSearchParams();
  const postId =
    typeof id === "string" ? Number(id) : Array.isArray(id) ? Number(id[0]) : 0;

  const { data: post, isLoading } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId,
  });

  const navigation = useNavigation();
  const updatePost = useUpdatePost();

  const postForm = useForm<FormValues>({
    defaultValues: {
      title: "",
      description: "",
      imageUris: [],
    },
  });

  // 데이터가 로드되면 폼 값 업데이트
  useEffect(() => {
    if (post) {
      postForm.reset({
        title: post.title || "",
        description: post.description || "",
        // imageUris: post.imageUris || [],
      });
    }
  }, [post]);

  const onSubmit = (formValues: FormValues) => {
    if (!postId) return;

    updatePost.mutate(
      {
        id: postId,
        body: {
          title: formValues.title,
          description: formValues.description,
        },
      },
      {
        onSuccess: () => {
          router.back();
        },
      }
    );
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <CustomButton
          label="저장"
          onPress={postForm.handleSubmit(onSubmit)}
          size="md"
          variant="primary"
          style={{ display: "none" }} // 헤더에 버튼을 숨김 처리
        />
      ),
    });
  }, [navigation, postForm]);

  // 로딩 중일 때 표시할 UI
  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text>로딩 중...</Text>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView style={styles.container}>
      <FormProvider {...postForm}>
        <TitleInput />
        <DescriptionInput />
        <View style={styles.submitButtonContainer}>
          <CustomButton
            label="게시물 업데이트"
            onPress={postForm.handleSubmit(onSubmit)}
            size="lg"
            variant="primary"
          />
        </View>
      </FormProvider>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 16,
    gap: 16,
  },
  submitButtonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
});
