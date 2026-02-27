"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, MoreVertical, Eye, EyeOff, Trash2, Heart } from "lucide-react";
import { fetchAdminPosts, updatePostStatus, deletePost, type AdminPost } from "@/lib/admin-api";

const statusLabels: Record<string, { label: string; color: string }> = {
  published: { label: "공개", color: "bg-green-100 text-green-700" },
  hidden: { label: "숨김", color: "bg-gray-100 text-gray-700" },
  reported: { label: "신고됨", color: "bg-orange-100 text-orange-700" },
  deleted: { label: "삭제됨", color: "bg-red-100 text-red-700" },
};

const statusFilters = [
  { value: "", label: "전체" },
  { value: "published", label: "공개" },
  { value: "hidden", label: "숨김" },
  { value: "reported", label: "신고됨" },
];

export default function AdminPostsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "posts", page, statusFilter],
    queryFn: () => fetchAdminPosts(page, 20, statusFilter || undefined),
  });

  const statusMutation = useMutation({
    mutationFn: ({ postId, status }: { postId: string; status: string }) =>
      updatePostStatus(postId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "posts"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      setSelectedPost(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (postId: string) => deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "posts"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      setSelectedPost(null);
    },
  });

  const totalPages = Math.ceil((data?.total ?? 0) / 20);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">게시물 관리</h2>
        <p className="mt-1 text-sm text-gray-500">총 {data?.total ?? 0}개의 게시물</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex rounded-lg border border-gray-200 bg-white p-1">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => {
                setStatusFilter(filter.value);
                setPage(1);
              }}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === filter.value
                  ? "bg-brand text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-xl bg-gray-100" />
          ))
        ) : data?.posts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-sm text-gray-500">
            게시물이 없습니다
          </div>
        ) : (
          data?.posts.map((post) => (
            <div
              key={post.id}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              {/* Image */}
              <div className="relative aspect-square bg-gray-100">
                {post.images[0]?.url ? (
                  <Image
                    src={post.images[0].url}
                    alt={post.description ?? "게시물 이미지"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">
                    이미지 없음
                  </div>
                )}
                {/* Status Badge */}
                <div className="absolute left-2 top-2">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      statusLabels[post.status]?.color ?? "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {statusLabels[post.status]?.label ?? post.status}
                  </span>
                </div>
                {/* Actions */}
                <div className="absolute right-2 top-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPost(selectedPost === post.id ? null : post.id)}
                    className="rounded-full bg-black/50 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <MoreVertical size={16} />
                  </button>
                  {selectedPost === post.id && (
                    <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                      {post.status === "published" ? (
                        <button
                          type="button"
                          onClick={() => statusMutation.mutate({ postId: post.id, status: "hidden" })}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                        >
                          <EyeOff size={14} className="text-gray-500" />
                          숨기기
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => statusMutation.mutate({ postId: post.id, status: "published" })}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                        >
                          <Eye size={14} className="text-green-500" />
                          공개하기
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("정말 삭제하시겠습니까?")) {
                            deleteMutation.mutate(post.id);
                          }
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {(post.pet as any)?.name ?? "알 수 없음"}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Heart size={12} />
                    {post.like_count}
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500 truncate">
                  @{(post.author as any)?.nickname ?? "익명"}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {new Date(post.created_at).toLocaleDateString("ko-KR")}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-50"
          >
            이전
          </button>
          <span className="text-sm text-gray-600">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-50"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
