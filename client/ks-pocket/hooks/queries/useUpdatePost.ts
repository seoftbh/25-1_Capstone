import { updatePost } from "@/api/post";
import { queryClient } from "@/api/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";

// 수정된 매개변수 타입 정의
type UpdatePostParams = {
  id: number;
  body: {
    title: string;
    description: string;
  };
};

export default function useUpdatePost() {
  return useMutation({
    // 매개변수를 구조 분해하여 updatePost 함수에 전달
    mutationFn: async ({ id, body }: UpdatePostParams) => {
      return await updatePost(id, body);
    },
    onSuccess: (data) => {
      // 업데이트된 게시물의 ID를 사용하여 해당 게시물의 캐시를 무효화
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      
      if (data && data.id) {
        queryClient.invalidateQueries({ queryKey: ["post", data.id] });
      }
    },
    onError: (error) => {
      console.error("포스트 업데이트 오류:", error);
      Alert.alert("오류", "포스트 업데이트에 실패했습니다. 다시 시도해주세요.");
    },
  });
}