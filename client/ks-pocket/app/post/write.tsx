import CustomButton from "@/components/CustomButton";
import DescriptionInput from "@/components/DescriptionInput";
import TitleInput from "@/components/TitleInput";
import useCreatePost from "@/hooks/queries/useCreatePost";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useNavigation } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { StyleSheet, Text, TouchableOpacity, View, Image, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { colors } from "@/constants";
import { supabase } from "@/lib/supabase";

type FormValues = {
  title: string;
  description: string;
  imageUris: string[];
  image_url?: string | null;
};

export default function PostWriteScreen() {
  const navigation = useNavigation();
  const createPost = useCreatePost();
  const { pickImage, uploadImage } = useImageUpload();
  const [image_url, setImage_url] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const postForm = useForm<FormValues>({
    defaultValues: {
      title: "",
      description: "",
      imageUris: [],
    },
  });

  const handleAddImage = async () => {
    const image = await pickImage();
    if (image) {
      const uploadedUrl = await uploadImage(image);
      if (uploadedUrl) {
        setImage_url(uploadedUrl);
      }
    }
  };

  const onSubmit = useCallback(async (formValues: FormValues) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      const postData = {
        title: formValues.title,
        description: formValues.description,
        image_url: image_url || undefined,
      };
      
      console.log("Submitting post data:", postData);
      
      // Supabase 직접 저장 방식
      if (formValues.title && formValues.description) {
        const { data, error } = await supabase
          .from('posts')
          .insert([postData]);
          
        if (error) {
          console.error("Error saving post:", error);
          Alert.alert("저장 실패", "게시물을 저장하는 중 오류가 발생했습니다.");
          return;
        }
        
        console.log("Post saved successfully:", data);
        // Alert.alert("성공", "게시물이 저장되었습니다.", [
        //   { text: "확인", onPress: () => navigation.goBack() }
        // ]);
        navigation.goBack();
      } else {
        Alert.alert("입력 오류", "제목과 내용을 모두 입력해주세요.");
      }
      
      // Custom hook 방식 (기존 코드는 주석 처리)
      // createPost.mutate(postData);
    } catch (error) {
      console.error("Submit error:", error);
      Alert.alert("오류 발생", "게시물 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }, [image_url, navigation, isSubmitting]);

  // 저장 버튼 렌더링 함수
  // const renderSaveButton = useCallback(() => (
  //   <CustomButton
  //     label="저장"
  //     onPress={() => postForm.handleSubmit(onSubmit)()}
  //     size="md"
  //     variant="primary"
  //     disabled={isSubmitting}
  //   />
  // ), [postForm, onSubmit, isSubmitting]);

  // useEffect(() => {
  //   navigation.setOptions({
  //     headerRight: renderSaveButton
  //   });
  // }, [navigation, renderSaveButton]);

  return (
    <KeyboardAwareScrollView style={styles.container}>
      <FormProvider {...postForm}>
        <TitleInput />
        <DescriptionInput />
        <TouchableOpacity style={styles.imageButton} onPress={handleAddImage}>
          <Ionicons name="image-outline" size={24} color={colors.BROWN_500} />
          <Text style={styles.imageButtonText}>이미지 추가</Text>
        </TouchableOpacity>
        {image_url && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: image_url }} style={styles.imagePreview} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => setImage_url(null)}
            >
              <Ionicons name="close-circle" size={24} color={colors.RED_500} />
            </TouchableOpacity>
          </View>
        )}
        
        {/* 화면 내부에 저장 버튼 추가 (문제 해결 위한 대안) */}
        <View style={styles.submitButtonContainer}>
          <CustomButton
            label="게시물 저장"
            onPress={postForm.handleSubmit(onSubmit)}
            size="lg"
            variant="primary"
            disabled={isSubmitting}
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
  },
  imageButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.GRAY_400,
    borderRadius: 8,
    marginVertical: 10,
    justifyContent: "center",
  },
  imageButtonText: {
    marginLeft: 8,
    color: colors.BROWN_500,
  },
  imagePreviewContainer: {
    position: "relative",
    marginVertical: 10,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    resizeMode: "cover",
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 12,
  },
  submitButtonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
});
