"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon, LayoutGrid } from "lucide-react";
import { fetchSearch, fetchPopularTags } from "@/lib/api";
import type { SearchFilterType } from "@/lib/types";
import { MobileLayout } from "@/components/layout/MobileLayout";
import Image from "next/image";
import Link from "next/link";

const MASONRY_HEIGHTS = [192, 224, 176, 240, 208, 160, 224, 192];

const FILTER_LABELS: Record<SearchFilterType, string> = {
  tag: "추천 태그",
  breed: "동물 종류",
};

const REGISTERED_BREEDS = [
  "골든 리트리버", "포메라니안", "말티즈", "푸들",
  "꼬숑 (말티즈+비숑)", "말티푸 (말티즈+푸들)", "페르시안", "브리티시 숏헤어",
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<SearchFilterType>("tag");

  const { data } = useQuery({
    queryKey: ["search", query, filterType],
    queryFn: () => fetchSearch({ q: query || undefined, filterType, limit: 20 }),
  });
  const { data: popularTags } = useQuery({
    queryKey: ["popularTags"],
    queryFn: fetchPopularTags,
  });

  const photos = data?.data ?? [];

  return (
    <MobileLayout hideHeader>
      <div className="p-4">
        {/* Search bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <SearchIcon
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              strokeWidth={1.5}
            />
            <input
              type="search"
              placeholder={FILTER_LABELS[filterType] + " 검색"}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-body-sm text-neutral-black-800 placeholder:text-gray-500 focus:border-brand focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand"
              aria-label="검색어 입력"
            />
          </div>
          <button type="button" className="p-2 text-gray-600" aria-label="갤러리 보기">
            <LayoutGrid size={22} strokeWidth={1.5} />
          </button>
        </div>

        {/* 검색 필터: 추천태그, 동물종류 */}
        <div className="mt-2 flex flex-wrap gap-2">
          {(["tag", "breed"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              className={`rounded-full px-3 py-1.5 text-body-sm ${
                filterType === type ? "bg-brand text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              {FILTER_LABELS[type]}
            </button>
          ))}
        </div>

        {/* 추천 태그 / 등록된 품종 */}
        <div className="mt-3 flex flex-wrap gap-2">
          {filterType === "tag" &&
            popularTags?.slice(0, 8).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setQuery(tag)}
                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-caption text-gray-600 active:bg-gray-50"
              >
                #{tag}
              </button>
            ))}
          {filterType === "breed" &&
            REGISTERED_BREEDS.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setQuery(b)}
                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-caption text-gray-600 active:bg-gray-50"
              >
                {b}
              </button>
            ))}
        </div>

        {/* Masonry photo grid */}
        <div className="mt-4 columns-2 gap-2 space-y-2">
          {photos.map((post, i) => {
            const h = MASONRY_HEIGHTS[i % MASONRY_HEIGHTS.length];
            return (
              <Link
                key={post.id}
                href={`/detail/${post.id}`}
                className="relative block break-inside-avoid overflow-hidden rounded-lg"
                style={{ height: h }}
              >
                <Image
                  src={post.images[0]?.url ?? ""}
                  alt={post.pet.name}
                  fill
                  sizes="50vw"
                  className="object-cover"
                />
              </Link>
            );
          })}
        </div>
      </div>
    </MobileLayout>
  );
}
