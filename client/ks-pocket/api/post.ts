import { supabase } from "../lib/supabase";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { Post } from "@/types";

async function createPost(body: { title: string; description: string }) {
  // 게시물 생성 및 반환을 한 번에 처리
  const { data, error } = await supabase
    .from("posts")
    .insert(body)
    .select("*")
    .single();

  if (error) {
    console.error("Error creating post:", error.message);
    throw error;
  }

  return data;
}

async function getPosts(page = 1, limit = 10): Promise<Post[]> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching posts:", error.message);
    return [];
  }

  // 각 게시물 데이터 처리
  return data ? data.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    createdAt: item.created_at,
    name: item.name,
    dept: item.dept,
    
    // 속성 이름 통일 (두 가지 형태 모두 제공)
    comment_count: item.comment_count || 0,
    commentCount: item.comment_count || 0,
    viewCount: item.view_count || 0,
    view_count: item.view_count || 0,
    
    // 기타 필요한 속성들
    userId: item.user_id || "",
    imageUris: item.image_uris || [],
    likes: item.likes || 0,
    hasVote: item.has_vote || false,
    voteCount: item.vote_count || 0,
    
    author: {
      id: item.user_id || "anonymous",
      nickname: item.name || "익명",
      imageUri: item.image_uri || "",
    },
  })) : [];
}

async function getPostById(id: number): Promise<Post | null> {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("게시물 조회 오류:", error);
      throw error;
    }

    // 반환할 데이터가 없는 경우
    if (!data) {
      return null;
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      createdAt: data.created_at,
      name: data.name,
      dept: data.dept,
      comment_count: data.comment_count || 0,
      viewCount: data.view_count || 0,
      
      // 필수 속성 추가
      userId: data.user_id || "",
      imageUris: data.image_uris || [],
      likes: data.likes || 0,
      hasVote: data.has_vote || false,
      voteCount: data.vote_count || 0,
      
      author: {
        id: data.user_id || "anonymous",
        nickname: data.name || "Unknown",
        imageUri: data.imageUri || data.image_uri || "",
      },
    };
  } catch (error) {
    console.error("getPostById 함수 오류:", error);
    throw error;
  }
}

async function updatePost(
  id: number,
  body: { title: string; description: string }
) {
  // id를 사용하여 게시물 업데이트
  const { data } = await supabase
    .from("posts")
    .update(body)
    .eq("id", id)
    .select("*")
    .single();
  return data;
}

async function deletePost(id: number): Promise<number> {
  // id를 사용하여 게시물 삭제
  const { data } = await supabase
    .from("posts")
    .delete()
    .eq("id", id)
    .select("*")
    .single();
  return data;
}

// 게시물 조회수 증가 함수
async function incrementViewCount(id: number): Promise<void> {
  try {
    // 현재 조회수 가져오기
    const { data: post, error: getError } = await supabase
      .from("posts")
      .select("view_count")
      .eq("id", id)
      .single();

    if (getError) {
      console.error("게시물 조회 오류:", getError);
      throw getError;
    }

    // 조회수 증가
    const { error: updateError } = await supabase
      .from("posts")
      .update({ view_count: (post.view_count || 0) + 1 })
      .eq("id", id);

    if (updateError) {
      console.error("조회수 증가 오류:", updateError);
      throw updateError;
    }
  } catch (error) {
    console.error("incrementViewCount 함수 오류:", error);
    // 조회수 업데이트 실패는 사용자 경험에 크게 영향을 미치지 않으므로 에러를 던지지 않고 로그만 남김
  }
}

export { createPost, getPosts, getPostById, updatePost, deletePost, incrementViewCount };
