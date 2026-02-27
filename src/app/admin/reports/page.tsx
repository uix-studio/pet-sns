"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Check, X, EyeOff, Ban } from "lucide-react";
import { fetchAdminReports, handleReport, type AdminReport } from "@/lib/admin-api";

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "대기중", color: "bg-orange-100 text-orange-700" },
  reviewed: { label: "처리됨", color: "bg-green-100 text-green-700" },
  dismissed: { label: "기각", color: "bg-gray-100 text-gray-700" },
};

const statusFilters = [
  { value: "", label: "전체" },
  { value: "pending", label: "대기중" },
  { value: "reviewed", label: "처리됨" },
  { value: "dismissed", label: "기각" },
];

export default function AdminReportsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedReport, setSelectedReport] = useState<AdminReport | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "reports", page, statusFilter],
    queryFn: () => fetchAdminReports(page, 20, statusFilter || undefined),
  });

  const handleMutation = useMutation({
    mutationFn: ({
      reportId,
      action,
      postId,
      userId,
    }: {
      reportId: string;
      action: "dismiss" | "hide_post" | "ban_user";
      postId?: string;
      userId?: string;
    }) => handleReport(reportId, action, postId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "posts"] });
      setSelectedReport(null);
    },
  });

  const totalPages = Math.ceil((data?.total ?? 0) / 20);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">신고 관리</h2>
        <p className="mt-1 text-sm text-gray-500">총 {data?.total ?? 0}건의 신고</p>
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

      {/* Reports List */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-100" />
          ))
        ) : data?.reports.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">신고가 없습니다</div>
        ) : (
          data?.reports.map((report) => (
            <div
              key={report.id}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="flex">
                {/* Post Image */}
                <div className="relative h-32 w-32 shrink-0 bg-gray-100">
                  {(report.post as any)?.images?.[0]?.url ? (
                    <Image
                      src={(report.post as any).images[0].url}
                      alt="신고된 게시물"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <AlertTriangle className="text-gray-300" size={32} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          statusLabels[report.status]?.color ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {statusLabels[report.status]?.label ?? report.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(report.created_at).toLocaleString("ko-KR")}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-900">
                      <span className="font-medium">신고 사유:</span> {report.reason}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      신고자: @{(report.reporter as any)?.nickname ?? "알 수 없음"} → 작성자: @
                      {(report.post as any)?.author?.nickname ?? "알 수 없음"}
                    </p>
                  </div>

                  {/* Actions */}
                  {report.status === "pending" && (
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleMutation.mutate({ reportId: report.id, action: "dismiss" })
                        }
                        className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                      >
                        <X size={14} />
                        기각
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleMutation.mutate({
                            reportId: report.id,
                            action: "hide_post",
                            postId: (report.post as any)?.id,
                          })
                        }
                        className="flex items-center gap-1 rounded-lg bg-orange-100 px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-200"
                      >
                        <EyeOff size={14} />
                        게시물 숨김
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleMutation.mutate({
                            reportId: report.id,
                            action: "ban_user",
                            userId: (report.post as any)?.author?.id,
                          })
                        }
                        className="flex items-center gap-1 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200"
                      >
                        <Ban size={14} />
                        사용자 차단
                      </button>
                    </div>
                  )}
                </div>
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
