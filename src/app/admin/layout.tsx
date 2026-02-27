"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileText, AlertTriangle, ArrowLeft } from "lucide-react";

const navItems = [
  { href: "/admin", label: "대시보드", icon: LayoutDashboard },
  { href: "/admin/users", label: "사용자", icon: Users },
  { href: "/admin/posts", label: "게시물", icon: FileText },
  { href: "/admin/reports", label: "신고", icon: AlertTriangle },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft size={20} />
              <span className="text-sm">앱으로</span>
            </Link>
            <div className="h-6 w-px bg-gray-200" />
            <h1 className="text-lg font-bold text-gray-900">멍냥멍냥 Admin</h1>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        {/* Sidebar */}
        <aside className="sticky top-14 h-[calc(100vh-56px)] w-56 shrink-0 border-r border-gray-200 bg-white">
          <nav className="flex flex-col gap-1 p-3">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-brand/10 text-brand"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="min-h-[calc(100vh-56px)] flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
