import { createComment } from "@/api/comment";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export default function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createComment,
    onSuccess: (data) => {
      // 댓글이 추가된 게시물의 ID를 사용하여 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ["comments", data.post_id] });
      queryClient.invalidateQueries({ queryKey: ["post", data.post_id] });
      // 모든 게시물 목록도 무효화
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error: any) => {
      console.error("댓글 작성 오류:", error);
      Alert.alert("오류", error.message || "댓글 작성에 실패했습니다.");
    }
  });
}