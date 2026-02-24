"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, Heart } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon | null;
}

const navItems: NavItem[] = [
  { href: "/", label: "홈", icon: Home },
  { href: "/search", label: "검색", icon: Search },
  { href: "/upload", label: "업로드", icon: PlusCircle },
  { href: "/like", label: "좋아요", icon: Heart },
  { href: "/my", label: "마이", icon: null },
];

export function BottomNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-50 flex h-12 w-full max-w-mobile -translate-x-1/2 items-center justify-around border-t border-[#dadada] bg-white safe-bottom"
      role="navigation"
      aria-label="하단 메뉴"
    >
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = isActive(href);

        if (!Icon) {
          return (
            <Link
              key={href}
              href={href}
              className="flex w-[72px] items-center justify-center py-3"
              aria-current={active ? "page" : undefined}
              aria-label={label}
            >
              <div className={`h-7 w-7 overflow-hidden rounded-full ${active ? "ring-2 ring-brand" : "ring-1 ring-coolGray-200"}`}>
                <Image src="/placeholder-1.png" alt="프로필" width={28} height={28} className="object-cover" />
              </div>
            </Link>
          );
        }

        return (
          <Link
            key={href}
            href={href}
            className={`flex w-[72px] items-center justify-center py-3 transition-colors ${
              active ? "text-brand" : "text-coolGray-600"
            }`}
            aria-current={active ? "page" : undefined}
            aria-label={label}
          >
            <Icon
              size={24}
              strokeWidth={active ? 2 : 1.5}
              fill={active && href === "/like" ? "currentColor" : "none"}
            />
          </Link>
        );
      })}
    </nav>
  );
}
