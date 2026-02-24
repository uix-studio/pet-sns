/**
 * API client - Supabase 연동
 */

import { supabase } from "./supabase";
import type { FeedPost, FeedResponse, RankingItem, SearchParams } from "./types";

/** Feed list with pagination */
export async function fetchFeed(cursor?: string, limit = 20): Promise<FeedResponse> {
  const offset = cursor ? parseInt(cursor, 10) : 0;

  const { data: posts, error } = await supabase
    .from("posts")
    .select(`
      id,
      description,
      location,
      view_count,
      like_count,
      created_at,
      author:profiles!posts_author_id_fkey (
        id,
        nickname,
        profile_image_url,
        level
      ),
      pet:pets!posts_pet_id_fkey (
        name,
        breed_name,
        age
      ),
      images:post_images (
        url,
        thumbnail_url
      )
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("fetchFeed error:", error);
    return { data: [], hasMore: false };
  }

  const feedPosts: FeedPost[] = (posts || []).map((post: any) => ({
    id: post.id,
    author: {
      id: post.author?.id || "",
      nickname: post.author?.nickname || "익명",
      profile_image_url: post.author?.profile_image_url,
      level: post.author?.level || 1,
    },
    images: (post.images || []).map((img: any) => ({
      url: img.url,
      thumbnailUrl: img.thumbnail_url,
    })),
    pet: {
      name: post.pet?.name || "반려동물",
      breed: post.pet?.breed_name || "",
      age: post.pet?.age,
    },
    description: post.description || "",
    location: post.location,
    createdAt: post.created_at,
    stats: {
      views: post.view_count || 0,
      likes: post.like_count || 0,
    },
  }));

  const nextOffset = offset + feedPosts.length;
  const hasMore = feedPosts.length === limit;

  return {
    data: feedPosts,
    nextCursor: String(nextOffset),
    hasMore,
  };
}

/** Feed detail */
export async function fetchFeedDetail(id: string): Promise<FeedPost | null> {
  const { data: post, error } = await supabase
    .from("posts")
    .select(`
      id,
      description,
      location,
      view_count,
      like_count,
      created_at,
      author:profiles!posts_author_id_fkey (
        id,
        nickname,
        profile_image_url,
        level
      ),
      pet:pets!posts_pet_id_fkey (
        name,
        breed_name,
        age
      ),
      images:post_images (
        url,
        thumbnail_url
      )
    `)
    .eq("id", id)
    .single();

  if (error || !post) {
    console.error("fetchFeedDetail error:", error);
    return null;
  }

  const p = post as any;
  return {
    id: p.id,
    author: {
      id: p.author?.id || "",
      nickname: p.author?.nickname || "익명",
      profile_image_url: p.author?.profile_image_url,
      level: p.author?.level || 1,
    },
    images: (p.images || []).map((img: any) => ({
      url: img.url,
      thumbnailUrl: img.thumbnail_url,
    })),
    pet: {
      name: p.pet?.name || "반려동물",
      breed: p.pet?.breed_name || "",
      age: p.pet?.age,
    },
    description: p.description || "",
    location: p.location,
    createdAt: p.created_at,
    stats: {
      views: p.view_count || 0,
      likes: p.like_count || 0,
    },
  };
}

/** Monthly ranking - top posts by like_count */
export async function fetchRankingMonthly(): Promise<RankingItem[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: posts, error } = await supabase
    .from("posts")
    .select(`
      id,
      description,
      location,
      view_count,
      like_count,
      created_at,
      author:profiles!posts_author_id_fkey (
        id,
        nickname,
        profile_image_url,
        level
      ),
      pet:pets!posts_pet_id_fkey (
        name,
        breed_name,
        age
      ),
      images:post_images (
        url,
        thumbnail_url
      )
    `)
    .eq("status", "published")
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("like_count", { ascending: false })
    .limit(10);

  if (error) {
    console.error("fetchRankingMonthly error:", error);
    return [];
  }

  return (posts || []).map((post: any, index: number) => ({
    rank: index + 1,
    post: {
      id: post.id,
      author: {
        id: post.author?.id || "",
        nickname: post.author?.nickname || "익명",
        profile_image_url: post.author?.profile_image_url,
        level: post.author?.level || 1,
      },
      images: (post.images || []).map((img: any) => ({
        url: img.url,
        thumbnailUrl: img.thumbnail_url,
      })),
      pet: {
        name: post.pet?.name || "반려동물",
        breed: post.pet?.breed_name || "",
        age: post.pet?.age,
      },
      description: post.description || "",
      location: post.location,
      createdAt: post.created_at,
      stats: {
        views: post.view_count || 0,
        likes: post.like_count || 0,
      },
    },
  }));
}

/** Search posts */
export async function fetchSearch(params: SearchParams): Promise<FeedResponse> {
  const offset = params.cursor ? parseInt(params.cursor, 10) : 0;
  const limit = params.limit ?? 20;

  let query = supabase
    .from("posts")
    .select(`
      id,
      description,
      location,
      view_count,
      like_count,
      created_at,
      author:profiles!posts_author_id_fkey (
        id,
        nickname,
        profile_image_url,
        level
      ),
      pet:pets!posts_pet_id_fkey (
        name,
        breed_name,
        age
      ),
      images:post_images (
        url,
        thumbnail_url
      )
    `)
    .eq("status", "published");

  // 검색어가 있으면 description에서 검색
  if (params.q) {
    query = query.ilike("description", `%${params.q}%`);
  }

  // 정렬
  if (params.sort === "popular") {
    query = query.order("like_count", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: posts, error } = await query.range(offset, offset + limit - 1);

  if (error) {
    console.error("fetchSearch error:", error);
    return { data: [], hasMore: false };
  }

  const feedPosts: FeedPost[] = (posts || []).map((post: any) => ({
    id: post.id,
    author: {
      id: post.author?.id || "",
      nickname: post.author?.nickname || "익명",
      profile_image_url: post.author?.profile_image_url,
      level: post.author?.level || 1,
    },
    images: (post.images || []).map((img: any) => ({
      url: img.url,
      thumbnailUrl: img.thumbnail_url,
    })),
    pet: {
      name: post.pet?.name || "반려동물",
      breed: post.pet?.breed_name || "",
      age: post.pet?.age,
    },
    description: post.description || "",
    location: post.location,
    createdAt: post.created_at,
    stats: {
      views: post.view_count || 0,
      likes: post.like_count || 0,
    },
  }));

  return {
    data: feedPosts,
    nextCursor: String(offset + feedPosts.length),
    hasMore: feedPosts.length === limit,
  };
}

/** Popular tags */
export async function fetchPopularTags(): Promise<string[]> {
  const { data, error } = await supabase
    .from("tags")
    .select("name")
    .order("usage_count", { ascending: false })
    .limit(10);

  if (error) {
    console.error("fetchPopularTags error:", error);
    return ["강아지", "고양이", "산책", "간식", "골든리트리버", "포메라니안"];
  }

  return (data as any[])?.map((t) => t.name) || [];
}

/** Breeds list */
export async function fetchBreeds(): Promise<{ id: string; name_ko: string; category: string }[]> {
  const { data, error } = await supabase
    .from("breeds")
    .select("id, name_ko, category")
    .order("name_ko");

  if (error) {
    console.error("fetchBreeds error:", error);
    return [];
  }

  return (data as any[]) || [];
}

export type LikedSort = "recent" | "oldest" | "likes";

/** Liked posts */
export async function fetchLikedPosts(cursor?: string, sort: LikedSort = "recent"): Promise<FeedResponse> {
  // TODO: 실제 사용자 인증 연동 후 user_id로 필터링
  return fetchFeed(cursor, 20);
}
