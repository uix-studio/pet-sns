"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon } from "lucide-react";
import { fetchPopularTags, fetchSearch } from "@/lib/api";
import { pickFeedImage } from "@/lib/feed-image";
import type { SearchFilterType } from "@/lib/types";
import { MobileLayout } from "@/components/layout/MobileLayout";
import Image from "next/image";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";

const MASONRY_HEIGHTS = [162, 339, 148, 162, 207, 300, 162, 128];
const FILTER_LABELS: Record<SearchFilterType, string> = {
  tag: "추천 태그",
  breed: "동물 종류",
};
const REGISTERED_BREEDS = [
  "골든 리트리버",
  "포메라니안",
  "말티즈",
  "푸들",
  "꼬숑 (말티즈+비숑)",
  "말티푸 (말티즈+푸들)",
  "페르시안",
  "브리티시 숏헤어",
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<SearchFilterType>("tag");
  const { data, isLoading, error } = useQuery({
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
      <div className="bg-white px-4 pb-4 pt-[18px]">
        <div className="flex h-[46px] items-center">
          <div className="relative h-11 flex-1 rounded-[8px] bg-[#f4f4f4]">
            <SearchIcon
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5f7081]"
              strokeWidth={1.5}
            />
            <input
              type="search"
              placeholder="검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-full w-full rounded-[8px] bg-transparent py-2 pl-9 pr-3 text-[14px] leading-5 text-[#2e2f33] placeholder:text-[#5f7081] focus:outline-none"
              aria-label="검색어 입력"
            />
          </div>
          <Link
            href="/my"
            className="ml-0.5 flex h-[46px] w-[44px] items-center justify-center"
            aria-label="내 프로필"
          >
            <Avatar alt="나" size="sm" className="h-7 w-7" />
          </Link>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {(["tag", "breed"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              className={`rounded-full px-3 py-1.5 text-[13px] leading-4 ${
                filterType === type ? "bg-brand text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              {FILTER_LABELS[type]}
            </button>
          ))}
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {filterType === "tag" &&
            popularTags?.slice(0, 8).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setQuery(tag)}
                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[12px] leading-4 text-gray-600 active:bg-gray-50"
              >
                #{tag}
              </button>
            ))}
          {filterType === "breed" &&
            REGISTERED_BREEDS.map((breed) => (
              <button
                key={breed}
                type="button"
                onClick={() => setQuery(breed)}
                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[12px] leading-4 text-gray-600 active:bg-gray-50"
              >
                {breed}
              </button>
            ))}
        </div>

        {error && (
          <p className="py-12 text-center text-body-sm text-red-500" role="alert">
            검색 결과를 불러오지 못했어요.
          </p>
        )}

        {isLoading && (
          <div className="mt-3 columns-2 gap-1 space-y-1">
            {[...Array.from({ length: 8 })].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-200"
                style={{ height: MASONRY_HEIGHTS[i % MASONRY_HEIGHTS.length] }}
              />
            ))}
          </div>
        )}

        {!isLoading && !error && photos.length === 0 && (
          <p className="py-12 text-center text-body-sm text-gray-500">검색 결과가 없어요.</p>
        )}

        <div className="mt-3 columns-2 gap-1 space-y-1">
          {photos.map((post, i) => {
            const h = MASONRY_HEIGHTS[i % MASONRY_HEIGHTS.length] ?? 162;
            return (
              <Link
                key={post.id}
                href={`/detail/${post.id}`}
                className="relative block break-inside-avoid overflow-hidden"
                style={{ height: h }}
              >
                <Image
                  src={pickFeedImage(post.images)}
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
