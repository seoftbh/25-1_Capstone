/**
|--------------------------------------------------
| 글쓰기 screen의 저장 버튼
|--------------------------------------------------
*/

import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Alert } from "react-native";

type PostFormValues = {
  title: string;
  description: string;
  imageUris: string[];
  image_url?: string; // 이미지 URL 추가
  name?: string;    // 사용자 이름 (선택적)
  dept?: string;    // 사용자 학과 (선택적)
};

export default function useCreatePost() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postData: PostFormValues) => {
      // 현재 로그인한 사용자 정보 가져오기
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("로그인이 필요합니다");
      }

      // 사용자 프로필 정보 가져오기
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("name, dept")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("프로필 정보 가져오기 오류:", profileError);
      }

      // 이미지 URL 로깅 (디버깅용)
      if (postData.image_url) {
        console.log("저장할 이미지 URL:", postData.image_url);
      }

      // posts 테이블에 데이터 삽입 - 이름과 학과 정보 포함
      const { data, error } = await supabase
        .from("posts")
        .insert({
          title: postData.title,
          description: postData.description,
          user_id: user.id,
          name: postData.name || profileData?.name || null,
          dept: postData.dept || profileData?.dept || null,
          image_url: postData.image_url, // DB 컬럼명에 맞게 이름 지정
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase 에러:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      router.back();
    //   Alert.alert("성공", "포스트가 성공적으로 저장되었습니다!");
    },
    onError: (error) => {
      console.error("포스트 생성 오류:", error);
      Alert.alert("오류", "포스트 저장에 실패했습니다. 다시 시도해주세요.");
    },
  });
}
