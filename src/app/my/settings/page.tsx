"use client";

import Link from "next/link";
import { ArrowLeft, ChevronRight, LogOut, Shield, FileText } from "lucide-react";
import { MobileLayout } from "@/components/layout/MobileLayout";

export default function MySettingsPage() {
  return (
    <MobileLayout
      showBottomNav={false}
      title="계정"
      headerLeft={
        <Link href="/my" className="p-2 text-neutral-black-800" aria-label="뒤로">
          <ArrowLeft size={22} strokeWidth={1.5} />
        </Link>
      }
    >
      <div className="space-y-6 p-4">
        {/* 로그인 정보 */}
        <section aria-labelledby="settings-login-info">
          <h2 id="settings-login-info" className="mb-2 text-caption font-semibold text-gray-500">
            로그인 정보
          </h2>
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3C6.5 3 2 6.58 2 11c0 2.84 1.86 5.33 4.63 6.78L5.4 21l4.1-2.15c.82.1 1.65.15 2.5.15 5.5 0 10-3.58 10-8s-4.5-8-10-8z" fill="#FEE500"/>
                  <path d="M8.5 10.5h7M8.5 13.5h5" stroke="#3C1E1E" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-body-sm font-medium text-neutral-black-800">카카오 로그인</p>
                <p className="text-caption text-gray-500">songmom@kakao.com</p>
              </div>
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-600">
                연결됨
              </span>
            </div>
          </div>
        </section>

        {/* 계정 관리 */}
        <section aria-labelledby="settings-account">
          <h2 id="settings-account" className="mb-2 text-caption font-semibold text-gray-500">
            계정 관리
          </h2>
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
            <Link
              href="/login"
              className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5"
            >
              <div className="flex items-center gap-3">
                <LogOut size={18} className="text-gray-500" strokeWidth={1.5} />
                <span className="text-body-sm text-neutral-black-800">로그아웃</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </Link>
            <Link
              href="/my"
              className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5"
            >
              <div className="flex items-center gap-3">
                <Shield size={18} className="text-gray-500" strokeWidth={1.5} />
                <span className="text-body-sm text-neutral-black-800">개인정보처리방침</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </Link>
            <Link
              href="/my"
              className="flex items-center justify-between px-4 py-3.5"
            >
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-gray-500" strokeWidth={1.5} />
                <span className="text-body-sm text-neutral-black-800">이용약관</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </Link>
          </div>
        </section>

        <p className="text-center text-caption text-gray-400">
          멍냥멍냥 v1.0.0
        </p>
      </div>
    </MobileLayout>
  );
}
