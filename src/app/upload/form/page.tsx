"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Tag, Pencil } from "lucide-react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useUpload } from "@/lib/upload-context";

export default function UploadFormPage() {
  const router = useRouter();
  const { images, clear } = useUpload();

  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
  });
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [hidePetName, setHidePetName] = useState(false);

  const addTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, "");
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handlePublish = () => {
    clear();
    router.push("/");
  };

  if (images.length === 0) {
    return (
      <MobileLayout showBottomNav={false} title="사진 게시">
        <div className="flex flex-col items-center justify-center gap-3 py-20">
          <p className="text-body-sm text-gray-500">선택된 사진이 없습니다.</p>
          <Link
            href="/upload"
            className="rounded-full bg-brand px-4 py-2 text-body-sm text-white active:bg-brand/90"
          >
            사진 선택하러 가기
          </Link>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      showBottomNav={false}
      headerLeft={
        <Link href="/upload" className="text-body-sm font-medium text-coolGray-600">
          이전
        </Link>
      }
      headerCenter={
        <span className="text-body-sm font-semibold tracking-wide text-neutral-black-800">
          사진 게시
        </span>
      }
      headerRight={
        <button
          type="button"
          onClick={handlePublish}
          className="text-body-sm font-medium text-coolGray-600"
        >
          완료
        </button>
      }
    >
      <div className="flex flex-col gap-0 px-4 pb-4">
        {/* Photo thumbnails — Figma: 3 across, ~101×127, with cover badge & edit icon */}
        <div className="relative pb-4 pt-2">
          <button
            type="button"
            className="absolute right-0 top-2 p-1 text-gray-500"
            aria-label="사진 편집"
            onClick={() => router.push("/upload")}
          >
            <Pencil size={18} strokeWidth={1.5} />
          </button>
          <div className="flex gap-2 overflow-x-auto">
            {images.map((img, idx) => (
              <div
                key={img.id}
                className="relative h-[127px] w-[101px] shrink-0 overflow-hidden rounded-md bg-gray-100"
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  sizes="101px"
                  className="object-cover"
                  unoptimized
                />
                {idx === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 rounded bg-white/70 px-1.5 py-0.5 text-[10px] font-medium text-brand">
                    커버
                  </span>
                )}
              </div>
            ))}
            {images.length < 3 &&
              Array.from({ length: 3 - images.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="h-[127px] w-[101px] shrink-0 rounded-md bg-gray-200"
                />
              ))}
          </div>
        </div>

        {/* Description input — Figma: bordered box, 90px height */}
        <textarea
          placeholder="사진에 어울리는 글을 간편하게 입력할 수 있어요."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="h-[90px] w-full resize-none rounded-md border border-coolGray-200 px-3 py-2.5 text-body-sm text-neutral-black-800 placeholder:text-coolGray-600 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />

        {/* Form fields — Figma: bordered rows, 52px each */}
        <div className="mt-4 divide-y divide-gray-300 overflow-hidden rounded-md border border-gray-300">
          {/* 날짜 */}
          <div className="flex h-[52px] items-center justify-between px-4">
            <span className="text-body-sm text-neutral-black-800">날짜</span>
            <div className="flex items-center gap-2 text-body-sm text-neutral-black-800">
              <span className="text-caption">{date}</span>
              <Calendar size={18} strokeWidth={1.5} className="text-gray-500" />
            </div>
          </div>

          {/* 장소 */}
          <div className="flex h-[52px] items-center justify-between px-4">
            <span className="text-body-sm text-neutral-black-800">장소</span>
            <div className="flex items-center gap-2">
              <input
                placeholder="장소 추가"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-28 text-right text-caption text-neutral-black-800 placeholder:text-gray-400 focus:outline-none"
              />
              <MapPin size={18} strokeWidth={1.5} className="text-gray-500" />
            </div>
          </div>

          {/* 태그 */}
          <div className="flex min-h-[52px] items-center justify-between px-4 py-2">
            <span className="text-body-sm text-neutral-black-800">태그</span>
            <div className="flex items-center gap-2">
              <div className="flex flex-wrap justify-end gap-1">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="rounded-full border border-brand px-2 py-0.5 text-caption text-brand"
                  >
                    {tag}
                  </button>
                ))}
                <input
                  placeholder="#태그"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  onBlur={addTag}
                  className="w-14 text-right text-caption text-neutral-black-800 placeholder:text-gray-400 focus:outline-none"
                />
              </div>
              <Tag size={18} strokeWidth={1.5} className="shrink-0 text-gray-500" />
            </div>
          </div>

          {/* 반려동물 이름 미표기 */}
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-body-sm text-neutral-black-800">반려동물 이름 미표기</p>
              <p className="text-[10px] text-gray-500">
                선택하면 게시글에 반려동물 이름이 보이지 않아요
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={hidePetName}
              onClick={() => setHidePetName(!hidePetName)}
              className={`relative h-[34px] w-[58px] shrink-0 rounded-full transition-colors ${
                hidePetName ? "bg-brand" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 h-[26px] w-[26px] rounded-full bg-white shadow transition-transform ${
                  hidePetName ? "translate-x-[28px]" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Bottom buttons — Figma: 취소 (outlined) + 게시하기 (filled dark) */}
        <div className="mt-6 flex gap-3">
          <Link
            href="/upload"
            className="flex h-9 flex-1 items-center justify-center rounded-md border border-coolGray-200 text-body-sm font-medium text-neutral-black-800 active:bg-gray-50"
          >
            취소
          </Link>
          <button
            type="button"
            onClick={handlePublish}
            className="flex h-9 flex-1 items-center justify-center rounded-md bg-neutral-black-800 text-body-sm font-medium text-white active:bg-neutral-black-800/90"
          >
            게시하기
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}
