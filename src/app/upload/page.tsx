"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Camera, ImageIcon, X } from "lucide-react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useUpload } from "@/lib/upload-context";

export default function UploadPage() {
  const { images, addFiles, removeImage, reorder } = useUpload();
  const [activeSource, setActiveSource] = useState<"gallery" | "camera" | null>(null);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleGalleryClick = () => {
    setActiveSource("gallery");
    galleryInputRef.current?.click();
  };

  const handleCameraClick = () => {
    setActiveSource("camera");
    cameraInputRef.current?.click();
  };

  const handleDragStart = (e: React.DragEvent, fromIdx: number) => {
    e.dataTransfer.setData("text/plain", String(fromIdx));
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent, toIdx: number) => {
    e.preventDefault();
    const fromIdx = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (!Number.isNaN(fromIdx)) reorder(fromIdx, toIdx);
  };

  const coverImage = images[0]?.url ?? null;

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
        images.length > 0 ? (
          <Link href="/upload/form" className="text-body-sm font-medium text-brand">
            다음
          </Link>
        ) : (
          <span className="text-body-sm text-gray-400">다음</span>
        )
      }
    >
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="flex flex-col">
        {/* Cover preview */}
        <div className="relative aspect-[4/3] w-full bg-gray-100">
          {coverImage ? (
            <Image
              src={coverImage}
              alt="선택된 사진"
              fill
              sizes="100vw"
              className="object-cover"
              priority
              unoptimized
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400">
              <ImageIcon size={48} strokeWidth={1} />
              <p className="text-body-sm">사진을 선택해 주세요</p>
            </div>
          )}
        </div>

        {/* Camera / Gallery */}
        <div className="flex items-center gap-4 border-b border-gray-100 px-4 py-3">
          <button
            type="button"
            onClick={handleCameraClick}
            className={`flex items-center gap-1.5 text-body-sm transition-colors active:scale-95 ${
              activeSource === "camera" ? "font-medium text-brand" : "text-gray-600"
            }`}
          >
            <Camera size={20} strokeWidth={1.5} />
            <span>촬영</span>
          </button>
          <button
            type="button"
            onClick={handleGalleryClick}
            className={`flex items-center gap-1.5 text-body-sm transition-colors active:scale-95 ${
              activeSource === "gallery" ? "font-medium text-brand" : "text-gray-600"
            }`}
          >
            <ImageIcon size={20} strokeWidth={1.5} />
            <span>갤러리</span>
          </button>
        </div>

        {/* Selected images strip */}
        {images.length > 0 && (
          <div className="border-b border-gray-100 px-2 py-3">
            <p className="mb-2 text-caption text-gray-500">
              드래그해서 순서를 바꿀 수 있어요 · 첫 번째가 커버
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, displayIdx) => (
                <div
                  key={img.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, displayIdx)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, displayIdx)}
                  className="relative h-20 w-20 shrink-0 cursor-grab overflow-hidden rounded-lg border-2 border-brand active:cursor-grabbing"
                >
                  <Image
                    src={img.url}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                    draggable={false}
                    unoptimized
                  />
                  {displayIdx === 0 && (
                    <span className="absolute left-1 top-1 rounded bg-brand px-1.5 py-0.5 text-[10px] font-medium text-white">
                      커버
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white"
                    aria-label="사진 삭제"
                  >
                    <X size={12} strokeWidth={2.5} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {images.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
            <p className="text-body-sm text-gray-500">
              위의 <span className="font-medium text-gray-700">촬영</span> 또는{" "}
              <span className="font-medium text-gray-700">갤러리</span> 버튼을 눌러
              <br />
              사진을 추가해 주세요
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCameraClick}
                className="flex items-center gap-1.5 rounded-full bg-gray-100 px-4 py-2.5 text-body-sm text-gray-700 active:bg-gray-200"
              >
                <Camera size={18} strokeWidth={1.5} />
                촬영하기
              </button>
              <button
                type="button"
                onClick={handleGalleryClick}
                className="flex items-center gap-1.5 rounded-full bg-brand px-4 py-2.5 text-body-sm text-white active:bg-brand/90"
              >
                <ImageIcon size={18} strokeWidth={1.5} />
                갤러리 열기
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        {images.length > 0 && (
          <div className="sticky bottom-0 border-t border-gray-200 bg-white px-4 py-3 text-center text-body-sm text-gray-600">
            선택된 항목 ({images.length}개) · 첫 번째 사진이 커버로 사용돼요
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
