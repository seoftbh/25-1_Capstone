import { supabase } from "@/lib/supabase";
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";
import { Platform } from "react-native";
import { nanoid } from "nanoid";
import { useAuthStore } from "@/api/auth";

export const useImageUpload = () => {
  const pickImage = async () => {
    // 이미지 라이브러리 접근 허용 요청
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      alert("이미지 라이브러리 접근 권한이 필요합니다!");
      return null;
    }
    
    // 이미지 선택기 실행
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });
    
    if (!result.canceled) {
      return result.assets[0];
    }
    
    return null;
  };
  
  const uploadImage = async (image: ImagePicker.ImagePickerAsset) => {
    if (!image.base64) {
      console.error("Base64 데이터가 없습니다.");
      return null;
    }
    
    // 현재 사용자 정보 가져오기
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    
    if (!userId) {
      console.error("로그인이 필요합니다.");
      return null;
    }
    
    try {
      const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const fileExt = image.uri.split('.').pop();
      const fileName = `${uniqueId}.${fileExt}`;
      // 사용자 ID를 포함한 파일 경로
      const filePath = `${userId}/${fileName}`;
      
      console.log("업로드 시도:", { filePath, userId });
      
      // Supabase Storage에 이미지 업로드
      const { data, error } = await supabase.storage
        .from("post-images")
        .upload(filePath, decode(image.base64), {
          contentType: `image/${fileExt}`,
          // 메타데이터로 사용자 ID 저장
          duplex: 'half',
          upsert: false
        });
        
      if (error) {
        console.error("이미지 업로드 에러:", error.message);
        return null;
      }
      
      // 이미지 URL 반환
      const { data: urlData } = supabase.storage
        .from("post-images")
        .getPublicUrl(filePath);
        
      if (urlData?.publicUrl) {
        console.log("이미지 업로드 성공, URL:", urlData.publicUrl);
        // 업로드된 이미지 URL 반환
        return urlData.publicUrl;
      }
      
      return null;
    } catch (error) {
      console.error("이미지 업로드 중 오류:", error);
      return null;
    }
  };
  
  return {
    pickImage,
    uploadImage,
  };
};