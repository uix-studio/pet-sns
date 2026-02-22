/** API/domain types aligned with architecture.md */

export interface User {
  id: string;
  nickname: string;
  profile_image_url?: string;
  level?: number;
}

export interface Breed {
  id: string;
  category: "dog" | "cat";
  name_ko: string;
  name_en?: string;
}

export interface FeedPost {
  id: string;
  author: User;
  images: { url: string; thumbnailUrl?: string }[];
  pet: { name: string; breed: string; age?: string };
  description: string;
  location?: string;
  createdAt: string;
  stats: { views: number; likes: number };
  likedByMe?: boolean;
}

export interface FeedResponse {
  data: FeedPost[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface RankingItem {
  rank: number;
  post: FeedPost;
}

export type SearchFilterType = "tag" | "breed";

export interface SearchParams {
  q?: string;
  breed?: string;
  filterType?: SearchFilterType;
  sort?: "recent" | "popular" | "distance";
  limit?: number;
  cursor?: string;
}
