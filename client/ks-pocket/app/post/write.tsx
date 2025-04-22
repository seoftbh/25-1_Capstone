import CustomButton from "@/components/CustomButton";
import DescriptionInput from "@/components/DescriptionInput";
import TitleInput from "@/components/TitleInput";
import useCreatePost from "@/hooks/queries/useCreatePost";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Button, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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

  const postForm = useForm<FormValues>({
    defaultValues: {
      title: "",
      description: "",
      // imageUris: [],
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

  const handleSubmit = async () => {
    const { title, description } = postForm.getValues();

    if (image_url) {
      const postData = {
        title,
        description,
        image_url: image_url,
      };

      const { data, error } = await supabase
        .from('posts')
        .insert([postData]);

      if (error) {
        console.error("Error saving post:", error);
      } else {
        console.log("Post saved successfully:", data);
      }
    }
  };

  const onSubmit = (formValues: FormValues) => {
    const postData = {
      ...formValues,
      image_url: image_url || undefined,
    };
    createPost.mutate(postData);
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <CustomButton
          label="저장"
          onPress={postForm.handleSubmit(onSubmit)}
          size="md"
          variant="primary"
          style={{display:"none"}}
        />
      ),
    });
  }, [navigation, postForm.formState.isValid]);

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
        <View style={styles.submitButtonContainer}>
          <CustomButton
            label="게시물 저장"
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
    margin: 16,
    gap: 16,
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
