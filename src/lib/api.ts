/**
 * API client - Supabase 연동
 */

import { supabase } from "./supabase";
import type { FeedPost, FeedResponse, RankingItem, SearchParams } from "./types";

export interface PublishPostInput {
  description?: string;
  location?: string;
  imageUrls: string[];
}

const LEGACY_LOCAL_FEED_KEY = "pet-sns-local-feed-posts";

function readLegacyLocalFeedPosts(): FeedPost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LEGACY_LOCAL_FEED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<{
      id?: string;
      description?: string;
      location?: string;
      createdAt?: string;
      images?: string[];
    }>;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((post) => Array.isArray(post.images) && post.images.length > 0)
      .map((post, idx) => ({
        id: post.id ?? `legacy-${idx}-${Date.now()}`,
        author: {
          id: "legacy-local",
          nickname: "나",
          profile_image_url: undefined,
          level: 1,
        },
        images: (post.images ?? [])
          .filter((url) => typeof url === "string" && url.trim().length > 0)
          .map((url) => ({ url })),
        pet: {
          name: "내 반려동물",
          breed: "",
        },
        description: post.description ?? "",
        location: post.location,
        createdAt: post.createdAt ?? new Date().toISOString(),
        stats: {
          views: 0,
          likes: 0,
        },
      }))
      .filter((post) => post.images.length > 0);
  } catch {
    return [];
  }
}

function getFallbackFeedPosts(): FeedPost[] {
  const now = new Date().toISOString();
  return [
    {
      id: "fallback-1",
      author: {
        id: "fallback-author-1",
        nickname: "룽지맘",
        profile_image_url: undefined,
        level: 1,
      },
      images: [{ url: "/deco-smile-1.svg" }],
      pet: {
        name: "누룽지",
        breed: "믹스",
      },
      description: "오늘은 제주도에서 신나게 뛰어놀았어요.",
      location: "제주도",
      createdAt: now,
      stats: {
        views: 0,
        likes: 0,
      },
    },
    {
      id: "fallback-2",
      author: {
        id: "fallback-author-2",
        nickname: "숑맘",
        profile_image_url: undefined,
        level: 1,
      },
      images: [{ url: "/deco-smile-2.svg" }],
      pet: {
        name: "숑이",
        breed: "말티즈",
      },
      description: "산책 후 간식 타임!",
      location: "서울",
      createdAt: now,
      stats: {
        views: 0,
        likes: 0,
      },
    },
    {
      id: "fallback-3",
      author: {
        id: "fallback-author-3",
        nickname: "냥집사",
        profile_image_url: undefined,
        level: 1,
      },
      images: [{ url: "/deco-cat-peek.svg" }],
      pet: {
        name: "코코",
        breed: "코리안 숏헤어",
      },
      description: "창문 밖 구경하는 코코.",
      location: "부산",
      createdAt: now,
      stats: {
        views: 0,
        likes: 0,
      },
    },
  ];
}

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
  const imageValidPosts = feedPosts.filter((post) =>
    (post.images || []).some((img) => typeof img?.url === "string" && img.url.trim().length > 0)
  );

  const nextOffset = offset + imageValidPosts.length;
  const hasMore = imageValidPosts.length === limit;
  const legacyLocalPosts = offset === 0 ? readLegacyLocalFeedPosts() : [];
  const fallbackPosts =
    offset === 0 && imageValidPosts.length === 0 && legacyLocalPosts.length === 0
      ? getFallbackFeedPosts()
      : [];

  return {
    data: offset === 0 ? [...legacyLocalPosts, ...imageValidPosts, ...fallbackPosts] : imageValidPosts,
    nextCursor: String(nextOffset),
    hasMore,
  };
}

async function ensureAuthorProfileId(): Promise<string> {
  const { data: existing } = (await (supabase
    .from("profiles")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle())) as any;

  if (existing?.id) return existing.id;

  const { data, error } = await (supabase.from("profiles") as any)
    .insert({
      email: `guest-${Date.now()}@pet-sns.local`,
      nickname: "게스트",
      profile_image_url: null,
      role: "user",
      status: "active",
    })
    .select("id")
    .single();

  if (error || !data?.id) throw new Error("프로필 생성에 실패했습니다.");
  return data.id;
}

async function ensurePrimaryPetId(userId: string): Promise<string> {
  const { data: existing } = (await (supabase
    .from("pets")
    .select("id")
    .eq("user_id", userId)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle())) as any;

  if (existing?.id) return existing.id;

  const { data, error } = await (supabase.from("pets") as any)
    .insert({
      user_id: userId,
      name: "내 반려동물",
      breed_id: null,
      breed_name: "미지정",
      age: null,
      profile_image_url: null,
      is_primary: true,
    })
    .select("id")
    .single();

  if (error || !data?.id) throw new Error("반려동물 생성에 실패했습니다.");
  return data.id;
}

/** Publish post to actual Supabase tables (posts, post_images) */
export async function publishPost(input: PublishPostInput): Promise<string> {
  const imageUrls = input.imageUrls.filter((url) => typeof url === "string" && url.trim().length > 0);
  if (imageUrls.length === 0) throw new Error("이미지가 없습니다.");

  const authorId = await ensureAuthorProfileId();
  const petId = await ensurePrimaryPetId(authorId);

  const { data: post, error: postError } = await (supabase.from("posts") as any)
    .insert({
      author_id: authorId,
      pet_id: petId,
      description: input.description?.trim() || null,
      location: input.location?.trim() || null,
      status: "published",
    })
    .select("id")
    .single();

  if (postError || !post?.id) throw new Error("게시글 저장에 실패했습니다.");

  const imageRows = imageUrls.map((url, index) => ({
    post_id: post.id,
    url,
    thumbnail_url: null,
    sort_order: index,
  }));
  const { error: imageError } = await (supabase.from("post_images") as any).insert(imageRows);
  if (imageError) throw new Error("게시글 이미지 저장에 실패했습니다.");

  return post.id as string;
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
