"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Heart, MapPin, Crown, Bell } from "lucide-react";
import { fetchFeed, fetchRankingMonthly } from "@/lib/api";
import { FEED_PLACEHOLDER_SRC, getValidImageUrls } from "@/lib/feed-image";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useLikes } from "@/lib/likes-context";

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
    <div className="flex w-full items-end border-b border-gray-200" role="tablist" aria-label="메인 피드 탭">
      <button
        type="button"
        onClick={() => setActiveTab("today")}
        role="tab"
        id="tab-today"
        aria-selected={activeTab === "today"}
        aria-controls="panel-today"
        className={`relative h-[39px] w-[89px] px-2 text-left text-[16px] font-semibold leading-[20.8px] transition-colors ${
          activeTab === "today" ? "text-brand" : "text-[#8f9dab]"
        }`}
      >
        투데이 멍냥
        {activeTab === "today" && (
          <span className="absolute inset-x-0 -bottom-px h-0.5 bg-brand" />
        )}
      </button>
      <button
        type="button"
        onClick={() => setActiveTab("monthly")}
        role="tab"
        id="tab-monthly"
        aria-selected={activeTab === "monthly"}
        aria-controls="panel-monthly"
        className={`relative h-[39px] w-[89px] px-2 text-left text-[16px] font-semibold leading-[20.8px] transition-colors ${
          activeTab === "monthly" ? "text-brand" : "text-[#8f9dab]"
        }`}
      >
        이달의 멍냥
        {activeTab === "monthly" && (
          <span className="absolute inset-x-0 -bottom-px h-0.5 bg-brand" />
        )}
      </button>
    </div>
  );

  return (
    <MobileLayout
      headerLeft={
        <Image src="/logo-horizontal.svg" alt="멍냥멍냥" width={142} height={32} priority />
      }
      headerRight={
        <Link href="/notifications" className="p-2 text-gray-500" aria-label="알림">
          <Bell size={24} strokeWidth={1.5} />
        </Link>
      }
    >
      {/* Tabs below header — Figma: 360×52, 탭 왼쪽 정렬 */}
      <div className="sticky top-12 z-30 flex h-[52px] items-end bg-white">
        {tabs}
      </div>

      {activeTab === "today" && (
        <div role="tabpanel" id="panel-today" aria-labelledby="tab-today">
          <TodayFeed feed={feed} />
        </div>
      )}
      {activeTab === "monthly" && (
        <div role="tabpanel" id="panel-monthly" aria-labelledby="tab-monthly">
          <MonthlyRanking ranking={ranking} />
        </div>
      )}
    </MobileLayout>
  );
}

function SafeFeedImage({
  images,
  alt,
  sizes,
  showDots = true,
  priority = false,
}: {
  images: Array<{ url?: string | null }> | undefined;
  alt: string;
  sizes: string;
  showDots?: boolean;
  priority?: boolean;
}) {
  const validUrls = getValidImageUrls(images);
  const [src, setSrc] = useState(validUrls[0] ?? FEED_PLACEHOLDER_SRC);

  useEffect(() => {
    setSrc(validUrls[0] ?? FEED_PLACEHOLDER_SRC);
  }, [validUrls]);

  return (
    <>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover"
        priority={priority}
        onError={() => {
          if (src !== FEED_PLACEHOLDER_SRC) setSrc(FEED_PLACEHOLDER_SRC);
        }}
      />
      {showDots && validUrls.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-[4px]">
          {validUrls.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 w-[15px] rounded-full ${idx === 0 ? "bg-white/80" : "bg-white/40"}`}
            />
          ))}
        </div>
      )}
    </>
  );
}

function TodayFeed({ feed }: { feed: ReturnType<typeof useInfiniteQuery<any>> }) {
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = feed;
  const { isLiked, toggle } = useLikes();
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
    <div className="space-y-3 bg-white pb-3">
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
        <FeedCard key={post.id} post={post} isLiked={isLiked(post.id)} onToggleLike={() => toggle(post.id)} />
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

function FeedCard({
  post,
  isLiked,
  onToggleLike,
}: {
  post: any;
  isLiked: boolean;
  onToggleLike: () => void;
}) {
  return (
    <article className="overflow-hidden bg-white">
      <div className="relative aspect-[9/10] w-full bg-gray-100">
        <SafeFeedImage
          images={post.images}
          alt={post.pet.name}
          sizes="(max-width: 360px) 100vw, 360px"
        />
        <button
          type="button"
          className="absolute right-3 top-4 text-white drop-shadow-md transition-transform active:scale-110"
          aria-label={isLiked ? "좋아요 취소" : "좋아요"}
          onClick={onToggleLike}
        >
          <Heart
            size={24}
            fill={isLiked ? "currentColor" : "none"}
            strokeWidth={1.8}
            className={isLiked ? "text-brand" : ""}
          />
        </button>
      </div>

      <div className="bg-white px-3 py-4">
        {/* 1행: 펫이름 / 날짜 */}
        <div className="flex items-center justify-between">
          <span className="text-[18px] font-semibold leading-[23.4px] text-brand">{post.pet.name}</span>
          <span className="text-[14px] leading-[18.2px] text-[#3d4854]">{formatDate(post.createdAt)}</span>
        </div>
        {/* 2행: 닉네임 / 위치 */}
        <div className="flex items-center justify-between">
          <span className="text-[14px] leading-[18.2px] text-[#3d4854]">{post.author.nickname}</span>
          {post.location && (
            <span className="flex items-center gap-0.5 text-[12px] leading-6 tracking-[0.5px] text-black">
              <MapPin size={12} strokeWidth={1.5} />
              {post.location}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function MonthlyRanking({ ranking }: { ranking: ReturnType<typeof useQuery<any>> }) {
  const { data, isLoading, error } = ranking;
  const { isLiked, toggle } = useLikes();
  const items = data ?? [];

  const rankLabel = (rank: number) => {
    if (rank === 1) return "1st";
    if (rank === 2) return "2nd";
    if (rank === 3) return "3rd";
    return `${rank}th`;
  };

  return (
    <div className="bg-[#fafafa] pb-4">
      {isLoading && (
        <div className="space-y-2 p-4">
          <div className="h-[360px] animate-pulse bg-gray-100" />
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[191px] animate-pulse bg-gray-100" />
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="py-12 text-center text-body-sm text-red-500" role="alert">
          랭킹을 불러오지 못했어요.
        </p>
      )}

      {items.length > 0 && (
        <>
          <div className="overflow-x-auto overscroll-x-contain px-4 pb-3 pt-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex w-max snap-x snap-mandatory gap-2 pr-8">
              {items.slice(0, 3).map((item: any) => (
                <article key={`top-${item.post.id}`} className="w-[302px] shrink-0 snap-start overflow-hidden bg-white">
                  <div className="relative h-[300px] w-full bg-gray-100">
                    <SafeFeedImage
                      images={item.post.images}
                      alt={`${item.rank}위 ${item.post.pet.name}`}
                      sizes="(max-width: 360px) 84vw, 302px"
                      showDots
                    />
                    <div className="absolute left-4 top-4 flex h-[33px] min-w-[33px] items-center justify-center rounded-full bg-[#656565]/85 px-2 text-[13px] font-semibold leading-none text-white shadow-sm">
                      {rankLabel(item.rank)}
                    </div>
                    <button
                      type="button"
                      className="absolute right-4 top-4 text-white drop-shadow-md transition-transform active:scale-110"
                      aria-label={isLiked(item.post.id) ? "좋아요 취소" : "좋아요"}
                      onClick={() => toggle(item.post.id)}
                    >
                      <Heart
                        size={21}
                        fill={isLiked(item.post.id) ? "currentColor" : "none"}
                        strokeWidth={1.8}
                        className={isLiked(item.post.id) ? "text-brand" : ""}
                      />
                    </button>
                  </div>
                  <div className="bg-white px-3 py-[6px]">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[18px] font-semibold leading-[23px] text-brand">
                        {item.rank === 1 && <Crown size={16} className="text-brand" fill="currentColor" />}
                        {item.post.pet.name}
                      </span>
                      <span className="text-[14px] leading-[18px] text-[#3d4854]">{formatDate(item.post.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] leading-[18px] text-[#3d4854]">{item.post.author.nickname}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-[10px] px-4">
            {items.slice(3, 11).map((item: any) => (
              <article key={item.post.id} className="overflow-hidden bg-white">
                <div className="relative h-[191px] w-full bg-gray-100">
                  <SafeFeedImage
                    images={item.post.images}
                    alt={`${item.rank}위 ${item.post.pet.name}`}
                    sizes="(max-width: 360px) 44vw, 159px"
                    showDots
                  />
                  <button
                    type="button"
                    className="absolute right-2.5 top-2.5 text-white drop-shadow-md transition-transform active:scale-110"
                    aria-label={isLiked(item.post.id) ? "좋아요 취소" : "좋아요"}
                    onClick={() => toggle(item.post.id)}
                  >
                    <Heart
                      size={18}
                      fill={isLiked(item.post.id) ? "currentColor" : "none"}
                      strokeWidth={1.8}
                      className={isLiked(item.post.id) ? "text-brand" : ""}
                    />
                  </button>
                </div>
                <div className="h-[48px] bg-white px-1.5 py-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[16px] font-semibold leading-[20px] text-brand">{item.post.pet.name}</p>
                      <p className="text-[12px] leading-[16px] text-[#3d4854]">{item.post.author.nickname}</p>
                    </div>
                    <p className="text-[12px] leading-[16px] text-[#3d4854]">{formatDate(item.post.createdAt)}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
