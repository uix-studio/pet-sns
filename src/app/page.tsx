"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Heart, MapPin, Crown, Bell, UserPlus, UserCheck } from "lucide-react";
import { fetchFeed, fetchRankingMonthly } from "@/lib/api";
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
    <div className="flex items-center">
      <button
        type="button"
        onClick={() => setActiveTab("today")}
        className={`relative px-2 pb-1 text-body-base font-semibold transition-colors ${
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
        className={`relative px-2 pb-1 text-body-base font-semibold transition-colors ${
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
        <Image src="/logo-horizontal.svg" alt="멍냥멍냥" width={142} height={32} priority />
      }
      headerRight={
        <Link href="/notifications" className="p-2 text-neutral-black-800" aria-label="알림">
          <Bell size={24} strokeWidth={1.5} />
        </Link>
      }
    >
      {/* Tabs below header — Figma: 360×52, 탭 왼쪽 정렬 */}
      <div className="sticky top-12 z-30 flex h-[52px] items-end bg-white pl-0">
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
  const [expanded, setExpanded] = useState(false);
  const [following, setFollowing] = useState(false);

  return (
    <article className="overflow-hidden bg-white">
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
        {post.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-[4px]">
            {post.images.map((_: any, idx: number) => (
              <div
                key={idx}
                className={`h-1.5 w-[15px] rounded-full ${idx === 0 ? "bg-white/80" : "bg-white/40"}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="bg-white py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-body-lg font-semibold text-brand">{post.pet.name}</span>
            <span className="text-body-sm text-coolGray-800">{post.author.nickname}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFollowing((p) => !p)}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                following
                  ? "bg-gray-100 text-gray-600"
                  : "bg-brand text-white"
              }`}
            >
              {following ? <UserCheck size={12} /> : <UserPlus size={12} />}
              {following ? "팔로잉" : "팔로우"}
            </button>
          </div>
        </div>

        {post.description && (
          <p className="mt-1.5 text-body-sm leading-relaxed text-coolGray-800">
            {expanded || (post.description?.length ?? 0) <= 60
              ? post.description
              : post.description.slice(0, 60) + "..."}
            {(post.description?.length ?? 0) > 60 && !expanded && (
              <button type="button" onClick={() => setExpanded(true)} className="ml-1 text-gray-400">
                더보기
              </button>
            )}
          </p>
        )}

        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-caption text-coolGray-600">{formatDate(post.createdAt)}</span>
          {post.location && (
            <span className="flex items-center gap-1 text-caption text-coolGray-600">
              <MapPin size={13} strokeWidth={1.5} />
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

  return (
    <div className="space-y-3 bg-white pb-3">
      {isLoading && (
        <div className="space-y-3 p-4">
          <div className="aspect-[4/3] animate-pulse rounded-xl bg-gray-100" />
          <div className="aspect-[4/3] animate-pulse rounded-xl bg-gray-100" />
        </div>
      )}

      {error && (
        <p className="py-12 text-center text-body-sm text-red-500" role="alert">
          랭킹을 불러오지 못했어요.
        </p>
      )}

      {data?.map((item: any) => (
        <article key={item.post.id} className="overflow-hidden bg-white">
          <div className="relative aspect-[9/10] w-full bg-gray-100">
            <Image
              src={item.post.images[0]?.url ?? ""}
              alt={`${item.rank}위 ${item.post.pet.name}`}
              fill
              sizes="(max-width: 360px) 100vw, 360px"
              className="object-cover"
            />
            {item.rank <= 3 && (
              <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur-sm">
                <Crown size={14} className="text-yellow-400" fill="currentColor" />
                <span className="text-[11px] font-bold text-white">{item.rank}위</span>
              </div>
            )}
            <button
              type="button"
              className="absolute right-3 top-4 text-white drop-shadow-md transition-transform active:scale-110"
              aria-label={isLiked(item.post.id) ? "좋아요 취소" : "좋아요"}
              onClick={() => toggle(item.post.id)}
            >
              <Heart
                size={24}
                fill={isLiked(item.post.id) ? "currentColor" : "none"}
                strokeWidth={1.8}
                className={isLiked(item.post.id) ? "text-brand" : ""}
              />
            </button>
          </div>

          <div className="bg-white py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-body-lg font-semibold text-brand">{item.post.pet.name}</span>
                <span className="text-body-sm text-coolGray-800">{item.post.author.nickname}</span>
              </div>
              {item.rank <= 3 && (
                <div className="flex items-center gap-1 text-caption text-yellow-600">
                  <Crown size={12} fill="currentColor" />
                  <span className="font-medium">{item.rank}위</span>
                </div>
              )}
            </div>
            {item.post.description && (
              <p className="mt-1.5 text-body-sm leading-relaxed text-coolGray-800">
                {item.post.description}
              </p>
            )}
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-caption text-coolGray-600">{formatDate(item.post.createdAt)}</span>
              {item.post.location && (
                <span className="flex items-center gap-1 text-caption text-coolGray-600">
                  <MapPin size={13} strokeWidth={1.5} />
                  {item.post.location}
                </span>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
