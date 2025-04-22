import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { create } from 'zustand';
import { useEffect } from 'react';

// 인증 상태 관리를 위한 스토어 정의
interface AuthState {
  session: Session | null;
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

// 인증 상태 관리 스토어 생성
export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  isLoggedIn: false,
  isLoading: true,
  
  // 앱 초기화 시 인증 상태 확인
  initialize: async () => {
    set({ isLoading: true });
    
    try {
      // 현재 세션 확인
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("세션 확인 오류:", error.message);
        set({ session: null, user: null, isLoggedIn: false, isLoading: false });
        return;
      }
      
      // 세션이 있으면 사용자 정보 가져오기
      if (session) {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("사용자 정보 확인 오류:", userError.message);
          set({ session: null, user: null, isLoggedIn: false, isLoading: false });
          return;
        }
        
        console.log("사용자 로그인 상태:", !!user);
        set({ session, user, isLoggedIn: !!user, isLoading: false });
      } else {
        set({ session: null, user: null, isLoggedIn: false, isLoading: false });
      }
    } catch (error) {
      console.error("인증 초기화 오류:", error);
      set({ session: null, user: null, isLoggedIn: false, isLoading: false });
    }
  },
  
  // 로그인 함수
  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("로그인 오류:", error.message);
        return { success: false, error: error.message };
      }
      
      console.log("로그인 성공:", !!data.user);
      set({ 
        session: data.session, 
        user: data.user, 
        isLoggedIn: !!data.user 
      });
      
      return { success: true };
    } catch (error: any) {
      console.error("로그인 중 예외 발생:", error);
      return { success: false, error: error.message || "로그인 중 오류가 발생했습니다." };
    }
  },
  
  // 회원가입 함수
  signUp: async (email: string, password: string, userData?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      
      if (error) {
        console.error("회원가입 오류:", error.message);
        return { success: false, error: error.message };
      }
      
      // Supabase는 회원가입 후 이메일 확인 절차가 있을 수 있음
      // 이메일 확인 필요 여부에 따라 처리 방식이 달라질 수 있음
      if (data.user?.identities?.length === 0) {
        return { success: false, error: "이미 가입된 이메일입니다." };
      }
      
      return { success: true };
    } catch (error: any) {
      console.error("회원가입 중 예외 발생:", error);
      return { success: false, error: error.message || "회원가입 중 오류가 발생했습니다." };
    }
  },
  
  // 로그아웃 함수
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("로그아웃 오류:", error.message);
        return;
      }
      
      set({ session: null, user: null, isLoggedIn: false });
    } catch (error) {
      console.error("로그아웃 중 예외 발생:", error);
    }
  }
}));

// 인증 상태 변경 리스너 설정 (앱 시작 시 한 번만 호출)
let authListenerInitialized = false;

export const initializeAuthListener = () => {
  if (authListenerInitialized) return;
  
  const { data: authListener } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log("Auth state changed:", event, !!session?.user);
      
      // 세션이 있으면 사용자 정보 가져오기
      if (session) {
        const { data: { user } } = await supabase.auth.getUser();
        useAuthStore.setState({ 
          session, 
          user, 
          isLoggedIn: !!user 
        });
      } else {
        useAuthStore.setState({ 
          session: null, 
          user: null, 
          isLoggedIn: false 
        });
      }
    }
  );
  
  authListenerInitialized = true;
};

// 자동 초기화를 위한 커스텀 훅
export const useInitializeAuth = () => {
  useEffect(() => {
    const initialize = async () => {
      await useAuthStore.getState().initialize();
      initializeAuthListener();
    };
    
    initialize();
  }, []);
};

// 수동 초기화 함수
export const initializeAuth = async () => {
  await useAuthStore.getState().initialize();
  initializeAuthListener();
};

// 디버깅 함수 추가
export const debugAuthState = () => {
  const state = useAuthStore.getState();
  console.log("Current auth state:", {
    isLoggedIn: state.isLoggedIn,
    user: state.user?.id,
    email: state.user?.email,
    session: !!state.session
  });
  return state;
};

// 현재 인증 상태 확인 헬퍼 함수
export const isAuthenticated = () => {
  return useAuthStore.getState().isLoggedIn;
};

// 현재 사용자 정보 가져오기 헬퍼 함수
export const getCurrentUser = () => {
  return useAuthStore.getState().user;
};