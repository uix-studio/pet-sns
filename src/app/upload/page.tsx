"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Camera, ImageIcon, Check, GripVertical } from "lucide-react";
import { MobileLayout } from "@/components/layout/MobileLayout";

const MOCK_GALLERY = [
  "/placeholder-1.png",
  "/placeholder-2.png",
  "/placeholder-3.png",
  "/placeholder-4.png",
  "/placeholder-1.png",
  "/placeholder-3.png",
];

export default function UploadPage() {
  const [selectedOrder, setSelectedOrder] = useState<number[]>([0]);
  const [activeSource, setActiveSource] = useState<"gallery" | "camera">("gallery");

  const orderedImages = selectedOrder.map((i) => MOCK_GALLERY[i] ?? "");
  const coverImage = orderedImages[0] ?? MOCK_GALLERY[0];

  const toggleSelect = (i: number) => {
    setSelectedOrder((prev) => {
      if (prev.includes(i)) return prev.filter((x) => x !== i);
      return [...prev, i];
    });
  };

  const handleDragStart = (e: React.DragEvent, fromIdx: number) => {
    e.dataTransfer.setData("text/plain", String(fromIdx));
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent, toIdx: number) => {
    e.preventDefault();
    const fromIdx = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (Number.isNaN(fromIdx) || fromIdx === toIdx) return;
    setSelectedOrder((prev) => {
      const arr = [...prev];
      const [removed] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, removed);
      return arr;
    });
  };

  return (
    <MobileLayout
      showBottomNav={false}
      headerLeft={
        <Link href="/" className="text-body-sm text-gray-600">
          취소
        </Link>
      }
      headerCenter={
        <span className="text-body-base font-bold text-neutral-black-800">사진 게시</span>
      }
      headerRight={
        <Link href="/upload/form" className="text-body-sm font-medium text-brand">
          다음
        </Link>
      }
    >
      <div className="flex flex-col">
        {/* Preview — 첫 번째 사진이 커버 */}
        <div className="relative aspect-[4/3] w-full bg-gray-100">
          <Image
            src={coverImage}
            alt="선택된 사진"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>

        {/* Camera / Gallery action row */}
        <div className="flex items-center gap-4 border-b border-gray-100 px-4 py-3">
          <button
            type="button"
            onClick={() => setActiveSource("camera")}
            className={`flex items-center gap-1.5 text-body-sm transition-colors active:scale-95 ${
              activeSource === "camera" ? "text-brand font-medium" : "text-gray-600"
            }`}
            aria-label="카메라로 촬영"
            aria-pressed={activeSource === "camera"}
          >
            <Camera size={20} strokeWidth={1.5} />
            <span>촬영</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSource("gallery")}
            className={`flex items-center gap-1.5 text-body-sm transition-colors active:scale-95 ${
              activeSource === "gallery" ? "text-brand font-medium" : "text-gray-600"
            }`}
            aria-label="갤러리 선택"
            aria-pressed={activeSource === "gallery"}
          >
            <ImageIcon size={20} strokeWidth={1.5} />
            <span>갤러리</span>
          </button>
        </div>

        {/* 선택된 사진 — 드래그로 순서 변경, 첫 번째에 커버 표기 */}
        {selectedOrder.length > 0 && (
          <div className="border-b border-gray-100 px-2 py-3">
            <p className="mb-2 text-caption text-gray-500">드래그해서 순서를 바꿀 수 있어요</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {selectedOrder.map((origIdx, displayIdx) => {
                const src = MOCK_GALLERY[origIdx] ?? "";
                const isCover = displayIdx === 0;
                return (
                  <div
                    key={`${origIdx}-${displayIdx}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, displayIdx)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, displayIdx)}
                    className="relative h-20 w-20 shrink-0 cursor-grab overflow-hidden rounded-lg border-2 border-brand active:cursor-grabbing"
                  >
                    <Image src={src} alt="" fill sizes="80px" className="object-cover" draggable={false} />
                    {isCover && (
                      <span className="absolute left-1 top-1 rounded bg-brand px-1.5 py-0.5 text-[10px] font-medium text-white">
                        커버
                      </span>
                    )}
                    <GripVertical
                      size={16}
                      className="absolute right-1 top-1/2 -translate-y-1/2 text-white drop-shadow-md"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3-column gallery grid — 클릭으로 선택/해제, 선택 시 border focus */}
        <div className="grid grid-cols-3 gap-0.5 p-0.5">
          {MOCK_GALLERY.map((src, i) => {
            const isSelected = selectedOrder.includes(i);
            const isCover = isSelected && selectedOrder[0] === i;
            return (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={() => toggleSelect(i)}
                className={`relative aspect-square overflow-hidden rounded border-2 transition-colors ${
                  isSelected ? "border-brand" : "border-transparent"
                }`}
                aria-pressed={isSelected}
                aria-label={`사진 ${i + 1} ${isSelected ? "선택 해제" : "선택"}`}
              >
                <Image src={src} alt="" fill sizes="33vw" className="object-cover" />
                {isSelected && (
                  <>
                    <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    {isCover && (
                      <span className="absolute left-1.5 top-1.5 rounded bg-brand px-2 py-0.5 text-caption font-medium text-white">
                        커버
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Selection count footer */}
        <div className="sticky bottom-0 border-t border-gray-200 bg-white px-4 py-3 text-center text-body-sm text-gray-600">
          선택된 항목 ({selectedOrder.length}개) · 첫 번째 사진이 커버로 사용돼요
        </div>
      </div>
    </MobileLayout>
  );
}
