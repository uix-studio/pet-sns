/**
 * Admin API - Supabase 연동
 */

import { supabase } from "./supabase";

// ========== 대시보드 통계 ==========
export interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalLikes: number;
  pendingReports: number;
  recentUsers: number;
  recentPosts: number;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const [users, posts, likes, reports, recentUsers, recentPosts] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("posts").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("likes").select("id", { count: "exact", head: true }),
    supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  return {
    totalUsers: users.count ?? 0,
    totalPosts: posts.count ?? 0,
    totalLikes: likes.count ?? 0,
    pendingReports: reports.count ?? 0,
    recentUsers: recentUsers.count ?? 0,
    recentPosts: recentPosts.count ?? 0,
  };
}

// ========== 사용자 관리 ==========
export interface AdminUser {
  id: string;
  email: string | null;
  nickname: string;
  profile_image_url: string | null;
  level: number;
  role: string;
  status: string;
  created_at: string;
  post_count?: number;
}

export async function fetchAdminUsers(page = 1, limit = 20): Promise<{ users: AdminUser[]; total: number }> {
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("fetchAdminUsers error:", error);
    return { users: [], total: 0 };
  }

  return { users: (data as AdminUser[]) || [], total: count ?? 0 };
}

export async function updateUserStatus(userId: string, status: string): Promise<boolean> {
  const { error } = await (supabase.from("profiles") as any).update({ status }).eq("id", userId);
  return !error;
}

export async function updateUserRole(userId: string, role: string): Promise<boolean> {
  const { error } = await (supabase.from("profiles") as any).update({ role }).eq("id", userId);
  return !error;
}

// ========== 게시물 관리 ==========
export interface AdminPost {
  id: string;
  description: string | null;
  location: string | null;
  like_count: number;
  view_count: number;
  status: string;
  created_at: string;
  author: { id: string; nickname: string } | null;
  pet: { name: string } | null;
  images: { url: string }[];
}

export async function fetchAdminPosts(
  page = 1,
  limit = 20,
  status?: string
): Promise<{ posts: AdminPost[]; total: number }> {
  const offset = (page - 1) * limit;

  let query = supabase
    .from("posts")
    .select(
      `
      id, description, location, like_count, view_count, status, created_at,
      author:profiles!posts_author_id_fkey ( id, nickname ),
      pet:pets!posts_pet_id_fkey ( name ),
      images:post_images ( url )
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) {
    console.error("fetchAdminPosts error:", error);
    return { posts: [], total: 0 };
  }

  return { posts: (data as any[]) || [], total: count ?? 0 };
}

export async function updatePostStatus(postId: string, status: string): Promise<boolean> {
  const { error } = await supabase.from("posts").update({ status }).eq("id", postId);
  return !error;
}

export async function deletePost(postId: string): Promise<boolean> {
  const { error } = await supabase.from("posts").delete().eq("id", postId);
  return !error;
}

// ========== 신고 관리 ==========
export interface AdminReport {
  id: string;
  reason: string;
  status: string;
  created_at: string;
  reporter: { id: string; nickname: string } | null;
  post: {
    id: string;
    description: string | null;
    author: { id: string; nickname: string } | null;
    images: { url: string }[];
  } | null;
}

export async function fetchAdminReports(
  page = 1,
  limit = 20,
  status?: string
): Promise<{ reports: AdminReport[]; total: number }> {
  const offset = (page - 1) * limit;

  let query = supabase
    .from("reports")
    .select(
      `
      id, reason, status, created_at,
      reporter:profiles!reports_reporter_id_fkey ( id, nickname ),
      post:posts!reports_post_id_fkey (
        id, description,
        author:profiles!posts_author_id_fkey ( id, nickname ),
        images:post_images ( url )
      )
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) {
    console.error("fetchAdminReports error:", error);
    return { reports: [], total: 0 };
  }

  return { reports: (data as any[]) || [], total: count ?? 0 };
}

export async function updateReportStatus(reportId: string, status: string): Promise<boolean> {
  const { error } = await supabase.from("reports").update({ status }).eq("id", reportId);
  return !error;
}

export async function handleReport(
  reportId: string,
  action: "dismiss" | "hide_post" | "ban_user",
  postId?: string,
  userId?: string
): Promise<boolean> {
  // 신고 상태 업데이트
  const reportStatus = action === "dismiss" ? "dismissed" : "reviewed";
  await updateReportStatus(reportId, reportStatus);

  // 추가 액션
  if (action === "hide_post" && postId) {
    await updatePostStatus(postId, "hidden");
  } else if (action === "ban_user" && userId) {
    await updateUserStatus(userId, "banned");
  }

  return true;
}
