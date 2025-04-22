import { deleteComment } from "@/api/comment";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export default function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteComment,
    onSuccess: (result, variables) => {
      // 댓글 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      
      // 현재 화면의 게시물 데이터도 갱신
      const postId = queryClient.getQueryData(["currentPostId"]);
      if (postId) {
        queryClient.invalidateQueries({ queryKey: ["post", postId] });
        // 모든 게시물 목록도 함께 무효화
        queryClient.invalidateQueries({ queryKey: ["posts"] });
      }
      
      Alert.alert("알림", "댓글이 삭제되었습니다.");
    },
    onError: (error: any) => {
      console.error("댓글 삭제 오류:", error);
      Alert.alert("오류", error.message || "댓글 삭제에 실패했습니다.");
    }
  });
}