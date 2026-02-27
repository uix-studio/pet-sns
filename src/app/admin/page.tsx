"use client";

import { useQuery } from "@tanstack/react-query";
import { Users, FileText, Heart, AlertTriangle, TrendingUp } from "lucide-react";
import { fetchDashboardStats } from "@/lib/admin-api";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: fetchDashboardStats,
  });

  const statCards = [
    {
      label: "전체 사용자",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: "bg-blue-500",
      sub: `최근 7일: +${stats?.recentUsers ?? 0}`,
    },
    {
      label: "전체 게시물",
      value: stats?.totalPosts ?? 0,
      icon: FileText,
      color: "bg-green-500",
      sub: `최근 7일: +${stats?.recentPosts ?? 0}`,
    },
    {
      label: "전체 좋아요",
      value: stats?.totalLikes ?? 0,
      icon: Heart,
      color: "bg-pink-500",
      sub: "누적 좋아요 수",
    },
    {
      label: "대기 중 신고",
      value: stats?.pendingReports ?? 0,
      icon: AlertTriangle,
      color: "bg-orange-500",
      sub: "처리 필요",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">대시보드</h2>
        <p className="mt-1 text-sm text-gray-500">멍냥멍냥 서비스 현황을 한눈에 확인하세요</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                {isLoading ? (
                  <div className="mt-2 h-8 w-20 animate-pulse rounded bg-gray-200" />
                ) : (
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {card.value.toLocaleString()}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400">{card.sub}</p>
              </div>
              <div className={`rounded-lg p-3 ${card.color}`}>
                <card.icon size={24} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">빠른 작업</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <a
            href="/admin/users"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:border-brand hover:bg-brand/5"
          >
            <Users size={20} className="text-blue-500" />
            <div>
              <p className="font-medium text-gray-900">사용자 관리</p>
              <p className="text-sm text-gray-500">사용자 조회 및 상태 변경</p>
            </div>
          </a>
          <a
            href="/admin/posts"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:border-brand hover:bg-brand/5"
          >
            <FileText size={20} className="text-green-500" />
            <div>
              <p className="font-medium text-gray-900">게시물 관리</p>
              <p className="text-sm text-gray-500">게시물 조회 및 숨김 처리</p>
            </div>
          </a>
          <a
            href="/admin/reports"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:border-brand hover:bg-brand/5"
          >
            <AlertTriangle size={20} className="text-orange-500" />
            <div>
              <p className="font-medium text-gray-900">신고 처리</p>
              <p className="text-sm text-gray-500">신고된 콘텐츠 검토</p>
            </div>
          </a>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <TrendingUp size={20} className="text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">최근 활동</h3>
        </div>
        <p className="mt-4 text-center text-sm text-gray-400 py-8">
          실시간 활동 로그가 여기에 표시됩니다
        </p>
      </div>
    </div>
  );
}
