"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Heart, MapPin, Crown } from "lucide-react";
import { fetchFeed, fetchRankingMonthly } from "@/lib/api";
import { MobileLayout } from "@/components/layout/MobileLayout";

type Tab = "today" | "monthly";

function formatDate(iso: string) {
  const d = new Date(iso);
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}.${mm}.${dd}`;
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>("today");

  const feed = useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam }) => fetchFeed(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.hasMore ? last.nextCursor : undefined),
  });
  const ranking = useQuery({
    queryKey: ["ranking", "monthly"],
    queryFn: fetchRankingMonthly,
    enabled: activeTab === "monthly",
  });

  const tabs = (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => setActiveTab("today")}
        className={`relative pb-1 text-body-base font-semibold transition-colors ${
          activeTab === "today" ? "text-brand" : "text-coolGray-600"
        }`}
      >
        투데이 멍냥
        {activeTab === "today" && (
          <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-brand" />
        )}
      </button>
      <button
        type="button"
        onClick={() => setActiveTab("monthly")}
        className={`relative pb-1 text-body-base font-semibold transition-colors ${
          activeTab === "monthly" ? "text-brand" : "text-coolGray-600"
        }`}
      >
        이달의 멍냥
        {activeTab === "monthly" && (
          <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-brand" />
        )}
      </button>
    </div>
  );

  return (
    <MobileLayout
      headerLeft={
        <Image src="/logo-horizontal.svg" alt="멍냥멍냥" width={106} height={24} priority />
      }
      headerRight={
        <Link href="/my" className="flex items-center justify-center" aria-label="마이페이지">
          <div className="h-7 w-7 overflow-hidden rounded-full bg-coolGray-200">
            <Image src="/placeholder-1.png" alt="프로필" width={28} height={28} className="object-cover" />
          </div>
        </Link>
      }
    >
      {/* Tabs below header — Figma: 360×52 */}
      <div className="sticky top-12 z-30 flex h-[52px] items-end border-b border-gray-200 bg-white px-4">
        {tabs}
      </div>

      {activeTab === "today" ? (
        <TodayFeed feed={feed} />
      ) : (
        <MonthlyRanking ranking={ranking} />
      )}
    </MobileLayout>
  );
}

function TodayFeed({ feed }: { feed: ReturnType<typeof useInfiniteQuery<any>> }) {
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = feed;
  const sentinelRef = useRef<HTMLDivElement>(null);

  const onSentinel = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || typeof window === "undefined") return;
    const ob = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && onSentinel()),
      { rootMargin: "200px", threshold: 0.1 }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, [onSentinel]);

  const posts = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <div className="space-y-3 bg-[#EFEFEF] py-3">
      {isLoading &&
        [1, 2, 3].map((i) => (
          <div key={i}>
            <div className="h-[400px] animate-pulse bg-gray-200" />
          </div>
        ))}

      {error && (
        <p className="py-12 text-center text-body-sm text-red-500" role="alert">
          피드를 불러오지 못했어요.
        </p>
      )}

      {posts.map((post: any) => (
        <article key={post.id}>
          <Link href={`/detail/${post.id}`} className="block">
            <div className="overflow-hidden bg-white">
              {/* Image — Figma: 360×400 (9:10) */}
              <div className="relative aspect-[9/10] w-full bg-gray-100">
                <Image
                  src={post.images[0]?.url ?? ""}
                  alt={post.pet.name}
                  fill
                  sizes="(max-width: 360px) 100vw, 360px"
                  className="object-cover"
                />
                <button
                  type="button"
                  className="absolute right-3 top-4 text-white drop-shadow-md"
                  aria-label={post.likedByMe ? "좋아요 취소" : "좋아요"}
                  onClick={(e) => e.preventDefault()}
                >
                  <Heart
                    size={24}
                    fill={post.likedByMe ? "currentColor" : "none"}
                    strokeWidth={1.8}
                    className={post.likedByMe ? "text-brand" : ""}
                  />
                </button>
                {post.images.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-[4px]">
                    {post.images.map((_: any, idx: number) => (
                      <div
                        key={idx}
                        className={`h-1.5 w-[15px] rounded-full ${
                          idx === 0 ? "bg-white/80" : "bg-white/40"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
              {/* Card info — Figma: px-12 py-16, 흰색 배경 */}
              <div className="bg-white px-3 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-body-lg font-semibold text-brand">{post.pet.name}</span>
                  <span className="text-body-sm text-coolGray-800">{formatDate(post.createdAt)}</span>
                </div>
                <div className="mt-0.5 flex items-center justify-between">
                  <span className="text-body-sm text-coolGray-800">{post.author.nickname}</span>
                  {post.location && (
                    <span className="flex items-center gap-1 text-caption text-black">
                      <MapPin size={16} strokeWidth={1.5} />
                      {post.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        </article>
      ))}

      {/* 무한 스크롤 sentinel */}
      <div ref={sentinelRef} className="h-4" aria-hidden />
      {isFetchingNextPage && (
        <div className="py-4 text-center">
          <span className="text-caption text-gray-500">더 불러오는 중...</span>
        </div>
      )}
    </div>
  );
}

function MonthlyRanking({ ranking }: { ranking: ReturnType<typeof useQuery<any>> }) {
  const { data, isLoading, error } = ranking;
  return (
    <div className="p-4 space-y-4">
      {isLoading && (
        <div className="space-y-3">
          <div className="aspect-[4/3] animate-pulse rounded-xl bg-gray-100" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="py-12 text-center text-body-sm text-red-500" role="alert">
          랭킹을 불러오지 못했어요.
        </p>
      )}

      {data != null && data.length > 0 && (
        <>
          {/* 1st place */}
          <Link href={`/detail/${data[0].post.id}`} className="block">
            <div className="overflow-hidden rounded-xl">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={data[0].post.images[0]?.url ?? ""}
                  alt={`1위 ${data[0].post.pet.name}`}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-white drop-shadow-md"
                  aria-label="좋아요"
                  onClick={(e) => e.preventDefault()}
                >
                  <Heart size={24} strokeWidth={1.8} fill="none" />
                </button>
                <div className="absolute bottom-0 inset-x-0 flex items-center gap-2 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <Crown size={20} className="text-yellow-400 shrink-0" fill="currentColor" />
                  <span className="text-body-sm font-bold text-white">1st · {data[0].post.author.nickname}</span>
                </div>
              </div>
              <div className="bg-white px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-body-sm font-bold text-brand">{data[0].post.pet.name}</span>
                  <span className="text-caption text-gray-500">{formatDate(data[0].post.createdAt)}</span>
                </div>
                <p className="mt-0.5 text-caption text-gray-600">{data[0].post.author.nickname}</p>
              </div>
            </div>
          </Link>

          {/* 2nd ~ 6th */}
          <div className="grid grid-cols-2 gap-3">
            {data.slice(1, 7).map((item: any) => (
              <Link key={item.post.id} href={`/detail/${item.post.id}`}>
                <div className="overflow-hidden rounded-xl bg-white">
                  <div className="relative aspect-square w-full">
                    <Image
                      src={item.post.images[0]?.url ?? ""}
                      alt={`${item.rank}위 ${item.post.pet.name}`}
                      fill
                      sizes="50vw"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-2 text-white drop-shadow-md"
                      aria-label="좋아요"
                      onClick={(e) => e.preventDefault()}
                    >
                      <Heart size={20} strokeWidth={1.8} fill="none" />
                    </button>
                  </div>
                  <div className="px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="truncate text-body-sm font-bold text-brand">{item.post.pet.name}</span>
                      <span className="text-caption text-gray-500">{formatDate(item.post.createdAt)}</span>
                    </div>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-caption text-gray-600">
                      {item.rank <= 3 && (
                        <Crown
                          size={12}
                          className="shrink-0 text-yellow-500"
                          fill="currentColor"
                          aria-hidden
                        />
                      )}
                      {item.post.author.nickname}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
