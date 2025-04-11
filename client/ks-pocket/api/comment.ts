import { supabase } from "@/lib/supabase";

// 댓글 생성 타입 정의
type CreateCommentDto = {
  post_id: number;
  content: string;
  user_id?: string; 
  name?: string; 
  dept?: string; 
};

// 댓글 생성
async function createComment(body: CreateCommentDto) {
  try {
    // 현재 로그인한 사용자 정보 가져오기
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && !body.user_id) {
      throw new Error("로그인이 필요합니다");
    }

    // 사용자 프로필 정보 가져오기 (로그인 상태일 경우)
    let profileData = null;
    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("name, dept")
        .eq("id", user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("프로필 정보 가져오기 오류:", profileError);
      }

      profileData = profile;
    }

    // comments 테이블에 데이터 삽입
    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: body.post_id,
        content: body.content,
        user_id: user?.id || body.user_id,
        name: body.name || profileData?.name || null,
        dept: body.dept || profileData?.dept || null,
      })
      .select()
      .single();

    if (error) {
      console.error("댓글 생성 오류:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("createComment 함수 오류:", error);
    throw error;
  }
}

// 댓글 조회 (특정 게시물의 모든 댓글)
async function getCommentsByPostId(post_id: number) {
  try {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", post_id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("댓글 조회 오류:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("getCommentsByPostId 함수 오류:", error);
    throw error;
  }
}

// 댓글 수정
async function updateComment(id: string, content: string) {
  try {
    // ID 유효성 검사
    if (!id || typeof id !== 'string') {
      throw new Error("유효하지 않은 댓글 ID입니다");
    }

    // 현재 로그인한 사용자 정보 가져오기
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("로그인이 필요합니다");
    }

    // 댓글 작성자 확인 (선택적)
    const { data: comment, error: commentError } = await supabase
      .from("comments")
      .select("user_id")
      .eq("id", id)
      .single();

    if (commentError) {
      console.error("댓글 조회 오류:", commentError);
      throw commentError;
    }

    // 작성자만 수정 가능하도록 체크 (선택적)
    if (comment.user_id !== user.id) {
      throw new Error("댓글 작성자만 수정할 수 있습니다");
    }

    // 댓글 업데이트
    const { data, error } = await supabase
      .from("comments")
      .update({ content })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("댓글 수정 오류:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("updateComment 함수 오류:", error);
    throw error;
  }
}

// 댓글 삭제
async function deleteComment(id: string) {
  try {
    // ID 유효성 검사
    if (!id || typeof id !== 'string') {
      throw new Error("유효하지 않은 댓글 ID입니다");
    }

    console.log("삭제할 댓글 ID:", id);

    // 현재 로그인한 사용자 정보 가져오기
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("로그인이 필요합니다");
    }

    // 댓글 작성자 확인 (선택적)
    const { data: comment, error: commentError } = await supabase
      .from("comments")
      .select("user_id")
      .eq("id", id)
      .single();

    if (commentError) {
      console.error("댓글 조회 오류:", commentError);
      throw commentError;
    }

    // 작성자만 삭제 가능하도록 체크 (선택적)
    if (comment.user_id !== user.id) {
      throw new Error("댓글 작성자만 삭제할 수 있습니다");
    }

    // 댓글 삭제
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("댓글 삭제 오류:", error);
      throw error;
    }

    return { success: true, id };
  } catch (error) {
    console.error("deleteComment 함수 오류:", error);
    throw error;
  }
}

export { createComment, getCommentsByPostId, updateComment, deleteComment };
