import { supabase } from "@/lib/supabase";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Post } from "@/types"; // @/types에서 Post 타입 가져오기

const POSTS_PER_PAGE = 10;

export default function useGetInfinitePosts() {
  return useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;
      
      // posts 테이블에서 페이징 처리하여 데이터 가져오기
      const { data, error } = await supabase
        .from("posts")
        .select("*") // 모든 필드 선택
        .order("created_at", { ascending: false }) // 최신 글부터 정렬
        .range(from, to);
      
      if (error) {
        console.error("Supabase 에러:", error);
        throw error;
      }
      
      // Supabase 응답 데이터를 Post 타입에 맞게 변환
      return data.map(item => ({
        id: item.id,
        userId: item.user_id,
        title: item.title,
        description: item.description,
        createdAt: item.created_at,
        name: item.name, // name 필드 추가
        dept: item.dept, // dept 필드 추가
        // @/types의 Post 타입에 필요한 다른 속성들도 여기서 매핑
        // 예를 들어 author, imageUris 등이 필요하다면 여기서 변환
        author: {
          nickname: item.name || "Unknown", // name을 nickname으로 사용
          imageUri: item.avatar || "" // avatar 필드가 있다면 사용
        },
        imageUris: item.image_uris || [],
        // 그 외 필요한 필드들
      })) as Post[];
    },
    getNextPageParam: (lastPage, allPages) => {
      // 마지막 페이지의 아이템 수가 POSTS_PER_PAGE와 같을 경우 다음 페이지가 있다고 간주
      return lastPage.length === POSTS_PER_PAGE ? allPages.length : undefined;
    },
    initialPageParam: 0,
  });
}
