import { supabase } from "@/lib/supabase";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Post } from "@/types";

const POSTS_PER_PAGE = 10;

export default function useGetInfinitePosts() {
  return useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: async ({ pageParam = 0 }) => {
      console.log("페이지 요청:", pageParam); // 디버깅용
      
      const from = pageParam * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;
      
      // posts 테이블에서 페이징 처리하여 데이터 가져오기
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);
      
      if (error) {
        console.error("Supabase 에러:", error);
        throw error;
      }

      console.log(`페이지 ${pageParam} 데이터 로드: ${data.length}개 항목`); // 디버깅용
      
      // Supabase 응답 데이터를 Post 타입에 맞게 변환
      return data.map(item => ({
        id: item.id,
        userId: item.user_id,
        title: item.title,
        description: item.description,
        createdAt: item.created_at,
        name: item.name,
        dept: item.dept,
        author: {
          nickname: item.name || "Unknown",
          imageUri: item.avatar || ""
        },
        imageUris: item.image_uris || [],
        image_url: item.image_url || "",
      })) as Post[];
    },
    getNextPageParam: (lastPage, allPages) => {
      // 디버깅용 로그 추가
      console.log(`마지막 페이지 항목 수: ${lastPage.length}, 전체 페이지 수: ${allPages.length}`);
      
      // 마지막 페이지가 비어있거나 항목 수가 POSTS_PER_PAGE보다 작으면 더 이상 페이지가 없음
      if (lastPage.length === 0 || lastPage.length < POSTS_PER_PAGE) {
        console.log("더 이상 페이지가 없습니다.");
        return undefined;
      }
      
      // 다음 페이지 번호 반환
      return allPages.length;
    },
    initialPageParam: 0,
  });
}
