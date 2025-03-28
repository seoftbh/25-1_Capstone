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

  return data || [];
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

    return data;
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

export { createPost, getPosts, getPostById, updatePost, deletePost };
