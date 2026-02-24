"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { fetchFeed, fetchLikedPosts, type LikedSort } from "@/lib/api";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { ImageGrid } from "@/components/ui/ImageGrid";
import { useLikes } from "@/lib/likes-context";

export default function LikePage() {
  const { likedIds } = useLikes();
  const [sort, setSort] = useState<LikedSort>("recent");

  const { data: allPosts, isLoading } = useQuery({
    queryKey: ["feed-liked", sort],
    queryFn: () => fetchLikedPosts(undefined, sort),
  });

  const likedPosts = (allPosts?.data ?? []).filter((p) => likedIds.has(p.id));

  const items = likedPosts.map((p) => ({
    id: p.id,
    imageUrl: p.images[0]?.url ?? "",
    alt: p.pet.name,
    href: `/detail/${p.id}`,
  }));

  const { data: popular } = useQuery({
    queryKey: ["popular"],
    queryFn: () => fetchFeed(),
  });

  const popularItems =
    popular?.data.slice(0, 6).map((p) => ({
      id: `pop-${p.id}`,
      imageUrl: p.images[0]?.url ?? "",
      alt: p.pet.name,
      href: `/detail/${p.id}`,
    })) ?? [];

  return (
    <MobileLayout
      title="내가 좋아하는 사진"
    >
      <div className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSort("recent")}
            className={`rounded-full px-3 py-1.5 text-caption ${sort === "recent" ? "bg-brand text-white" : "bg-gray-100 text-gray-600"}`}
          >
            최신순
          </button>
          <button
            type="button"
            onClick={() => setSort("oldest")}
            className={`rounded-full px-3 py-1.5 text-caption ${sort === "oldest" ? "bg-brand text-white" : "bg-gray-100 text-gray-600"}`}
          >
            오래된순
          </button>
          <button
            type="button"
            onClick={() => setSort("likes")}
            className={`rounded-full px-3 py-1.5 text-caption ${sort === "likes" ? "bg-brand text-white" : "bg-gray-100 text-gray-600"}`}
          >
            좋아요수
          </button>
        </div>

        {isLoading && (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <Heart size={40} className="text-gray-300" strokeWidth={1.2} />
            <p className="text-body-sm text-gray-500">좋아요한 게시물이 없어요.</p>
          </div>
        )}

        {items.length > 0 && <ImageGrid items={items} columns={2} gap="md" />}
      </div>

      {/* Popular photos section */}
      {popularItems.length > 0 && (
        <div className="border-t border-gray-100 p-4">
          <h2 className="text-body-sm font-bold text-neutral-black-800">인기 사진</h2>
          <p className="mt-1 text-caption text-gray-500">
            멍냥멍냥에서 인기있는 사진 추천드려요.
          </p>
          <div className="mt-3">
            <ImageGrid items={popularItems} columns={2} gap="md" />
          </div>
        </div>
      )}
    </MobileLayout>
  );
}
