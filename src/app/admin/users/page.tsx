"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, MoreVertical, Shield, Ban, CheckCircle } from "lucide-react";
import { fetchAdminUsers, updateUserStatus, updateUserRole, type AdminUser } from "@/lib/admin-api";

const statusLabels: Record<string, { label: string; color: string }> = {
  active: { label: "활성", color: "bg-green-100 text-green-700" },
  suspended: { label: "정지", color: "bg-yellow-100 text-yellow-700" },
  banned: { label: "차단", color: "bg-red-100 text-red-700" },
};

const roleLabels: Record<string, { label: string; color: string }> = {
  user: { label: "일반", color: "bg-gray-100 text-gray-700" },
  admin: { label: "관리자", color: "bg-purple-100 text-purple-700" },
};

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", page],
    queryFn: () => fetchAdminUsers(page, 20),
  });

  const statusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: string }) =>
      updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setSelectedUser(null);
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setSelectedUser(null);
    },
  });

  const filteredUsers = data?.users.filter(
    (user) =>
      user.nickname.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil((data?.total ?? 0) / 20);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">사용자 관리</h2>
        <p className="mt-1 text-sm text-gray-500">총 {data?.total ?? 0}명의 사용자</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="닉네임 또는 이메일로 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">사용자</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">이메일</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">레벨</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">역할</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">상태</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">가입일</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={7} className="px-4 py-4">
                    <div className="h-10 animate-pulse rounded bg-gray-100" />
                  </td>
                </tr>
              ))
            ) : filteredUsers?.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-500">
                  사용자가 없습니다
                </td>
              </tr>
            ) : (
              filteredUsers?.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 overflow-hidden rounded-full bg-gray-100">
                        {user.profile_image_url ? (
                          <Image
                            src={user.profile_image_url}
                            alt={user.nickname}
                            width={36}
                            height={36}
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm font-medium text-gray-400">
                            {user.nickname[0]}
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-gray-900">{user.nickname}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.email ?? "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">Lv.{user.level}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        roleLabels[user.role]?.color ?? "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {roleLabels[user.role]?.label ?? user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        statusLabels[user.status]?.color ?? "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {statusLabels[user.status]?.label ?? user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(user.created_at).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                        className="rounded p-1 hover:bg-gray-100"
                      >
                        <MoreVertical size={18} className="text-gray-400" />
                      </button>
                      {selectedUser === user.id && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                          {user.role === "user" ? (
                            <button
                              type="button"
                              onClick={() => roleMutation.mutate({ userId: user.id, role: "admin" })}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                            >
                              <Shield size={14} className="text-purple-500" />
                              관리자로 변경
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => roleMutation.mutate({ userId: user.id, role: "user" })}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                            >
                              <Shield size={14} className="text-gray-500" />
                              일반으로 변경
                            </button>
                          )}
                          {user.status === "active" ? (
                            <button
                              type="button"
                              onClick={() => statusMutation.mutate({ userId: user.id, status: "banned" })}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                            >
                              <Ban size={14} />
                              사용자 차단
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => statusMutation.mutate({ userId: user.id, status: "active" })}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-green-600 hover:bg-green-50"
                            >
                              <CheckCircle size={14} />
                              차단 해제
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
