import { QueryClient } from "@tanstack/react-query";

// 전역 QueryClient 인스턴스 생성
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 기본 설정 - 필요에 따라 조정
      staleTime: 1000 * 60 * 5, // 5분
      gcTime: 1000 * 60 * 30, // 30분
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});