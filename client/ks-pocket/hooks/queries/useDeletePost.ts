import { deletePost } from "@/api/post";
import { queryClient } from "@/api/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";

export default function useDeletePost() {
  return useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      Alert.alert("알림", "게시물이 삭제되었습니다.");
    },
    onError: (error) => {
      console.error("게시물 삭제 오류:", error);
      Alert.alert("오류", "게시물 삭제에 실패했습니다. 다시 시도해주세요.");
    },
  });
}