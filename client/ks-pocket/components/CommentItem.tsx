import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, Alert } from "react-native";
import FeedHeader from "./FeedHeader";
import { Ionicons } from "@expo/vector-icons";
import { useActionSheet } from "@expo/react-native-action-sheet";
import useDeleteComment from "@/hooks/queries/useDeleteComment";
import { colors } from "@/constants";
import { supabase } from "@/lib/supabase";

interface CommentItemProps {
  comment: {
    id: string;
    content: string;
    createdAt: string;
    user_id?: string;
    name?: string;
    dept?: string;
    isDeleted?: boolean;
    author?: {
      nickname?: string;
      imageUri?: string;
      dept?: string;
    }
  };
}

function CommentItem({ comment }: CommentItemProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { showActionSheetWithOptions } = useActionSheet();
  const deleteComment = useDeleteComment();

  // Supabase auth를 사용하여 현재 사용자 정보 가져오기
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("사용자 정보 가져오기 오류:", error);
      } else {
        setCurrentUser(user);
      }
    };

    fetchUser();
  }, []);

  const handlePressOption = () => {
    const options = ["삭제", "취소"];
    const cancelButtonIndex = 1;
    const destructiveButtonIndex = 0;

    showActionSheetWithOptions({
      options,
      cancelButtonIndex,
      destructiveButtonIndex
    }, (selectedIndex?: number) => {
      switch (selectedIndex) {
        case destructiveButtonIndex:
          // 삭제 전 확인 메시지 표시
          Alert.alert(
            "댓글 삭제",
            "이 댓글을 정말 삭제하시겠습니까?",
            [
              {
                text: "취소",
                style: "cancel"
              },
              {
                text: "삭제",
                style: "destructive",
                onPress: () => {
                  // 확인 후 삭제 실행
                  deleteComment.mutate(comment.id, {
                    onSuccess: () => {
                      console.log("삭제 성공");
                    },
                    onError: (error) => {
                      console.error("삭제 실패", error);
                    }
                  });
                }
              }
            ],
            { cancelable: true }
          );
          break;
        case cancelButtonIndex:
          console.log("취소");
          break;
      }
    });
  };

  // 현재 사용자가 이 댓글의 작성자인지 확인
  const isCommentOwner = currentUser?.id === comment.user_id;

  return (
    <View style={styles.container}>
      <FeedHeader
        nickname={comment.name || comment.author?.nickname || "익명"}
        imageUri={comment.author?.imageUri}
        dept={comment.dept || comment.author?.dept}
        createdAt={comment.createdAt}
        onPress={() => {}}
        option={
          isCommentOwner && !comment.isDeleted ? (
            <Ionicons 
              name="ellipsis-vertical" 
              size={16} 
              color={colors.GRAY_700} 
              onPress={handlePressOption} 
            />
          ) : null
        }
      />
      
      <View style={styles.contentContainer}>
        <Text style={comment.isDeleted ? styles.deletedText : styles.contentText}>
          {comment.isDeleted ? "삭제된 댓글입니다" : comment.content}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: colors.WHITE,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  contentContainer: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  contentText: {
    fontSize: 15,
    color: colors.BLACK,
    lineHeight: 20,
  },
  deletedText: {
    fontSize: 15,
    color: colors.GRAY_500,
    fontStyle: 'italic',
  },
});

export default CommentItem;
