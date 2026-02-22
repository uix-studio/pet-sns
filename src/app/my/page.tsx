"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowDownUp, Check, Pencil, Trash2, X, Camera, ChevronDown } from "lucide-react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Avatar } from "@/components/ui/Avatar";

const BREED_LIST = [
  "골든 리트리버", "포메라니안", "말티즈", "시바견", "비숑 프리제",
  "푸들", "치와와", "웰시코기", "프렌치 불독", "보더콜리",
  "페르시안", "러시안 블루", "브리티시 숏헤어", "스코티시 폴드", "랙돌",
  "꼬숑 (말티즈+비숑)", "말티푸 (말티즈+푸들)", "폼스키 (포메라니안+허스키)",
  "코카푸 (코커스패니얼+푸들)", "골든두들 (골든리트리버+푸들)",
  "믹스견", "믹스묘",
];

interface MyPost {
  id: string;
  imageUrl: string;
  description: string;
}

const INITIAL_POSTS: MyPost[] = [
  { id: "1", imageUrl: "/placeholder-3.png", description: "오늘 산책 나왔어요" },
  { id: "2", imageUrl: "/placeholder-4.png", description: "간식 먹는 중" },
  { id: "3", imageUrl: "/placeholder-1.png", description: "낮잠 자는 모습" },
  { id: "4", imageUrl: "/placeholder-2.png", description: "목욕 후 뽀송뽀송" },
  { id: "5", imageUrl: "/placeholder-3.png", description: "공원에서 놀기" },
  { id: "6", imageUrl: "/placeholder-4.png", description: "새 옷 입었어요" },
];

type ContentTab = "사진" | "영상" | "기록";

export default function MyPage() {
  const [contentTab, setContentTab] = useState<ContentTab>("사진");
  const [posts, setPosts] = useState<MyPost[]>(INITIAL_POSTS);

  const [isManaging, setIsManaging] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [nickname, setNickname] = useState("송맘");
  const [petName, setPetName] = useState("송이");
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(nickname);
  const nicknameRef = useRef<HTMLInputElement>(null);

  const [isEditingPetName, setIsEditingPetName] = useState(false);
  const [petNameInput, setPetNameInput] = useState(petName);
  const petNameRef = useRef<HTMLInputElement>(null);

  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const [petBreed, setPetBreed] = useState("");
  const [isEditingBreed, setIsEditingBreed] = useState(false);
  const [breedInput, setBreedInput] = useState("");
  const [showBreedDropdown, setShowBreedDropdown] = useState(false);
  const [isCustomBreed, setIsCustomBreed] = useState(false);
  const breedRef = useRef<HTMLInputElement>(null);

  const filteredBreeds = breedInput.trim()
    ? BREED_LIST.filter((b) => b.includes(breedInput.trim()))
    : BREED_LIST;

  const startEditingBreed = () => {
    setBreedInput(petBreed);
    setIsEditingBreed(true);
    setIsCustomBreed(false);
    setShowBreedDropdown(true);
    setTimeout(() => breedRef.current?.focus(), 0);
  };

  const selectBreed = (breed: string) => {
    setPetBreed(breed);
    setBreedInput(breed);
    setIsEditingBreed(false);
    setShowBreedDropdown(false);
  };

  const saveBreed = () => {
    const trimmed = breedInput.trim();
    if (trimmed) setPetBreed(trimmed);
    setIsEditingBreed(false);
    setShowBreedDropdown(false);
    setIsCustomBreed(false);
  };

  const cancelBreed = () => {
    setBreedInput(petBreed);
    setIsEditingBreed(false);
    setShowBreedDropdown(false);
    setIsCustomBreed(false);
  };

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingDesc, setEditingDesc] = useState("");
  const editDescRef = useRef<HTMLInputElement>(null);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleDeleteSelected = () => {
    setPosts((prev) => prev.filter((p) => !selectedIds.has(p.id)));
    setSelectedIds(new Set());
    setIsManaging(false);
  };

  const handleDeleteSingle = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const startEditingNickname = () => {
    setNicknameInput(nickname);
    setIsEditingNickname(true);
    setTimeout(() => nicknameRef.current?.focus(), 0);
  };

  const saveNickname = () => {
    const trimmed = nicknameInput.trim();
    if (trimmed) setNickname(trimmed);
    setIsEditingNickname(false);
  };

  const cancelNickname = () => {
    setNicknameInput(nickname);
    setIsEditingNickname(false);
  };

  const startEditingPetName = () => {
    setPetNameInput(petName);
    setIsEditingPetName(true);
    setTimeout(() => petNameRef.current?.focus(), 0);
  };

  const savePetName = () => {
    const trimmed = petNameInput.trim();
    if (trimmed) setPetName(trimmed);
    setIsEditingPetName(false);
  };

  const cancelPetName = () => {
    setPetNameInput(petName);
    setIsEditingPetName(false);
  };

  const sortedPosts = sortOrder === "oldest" ? [...posts].reverse() : posts;

  const startEditingPost = (post: MyPost) => {
    setEditingPostId(post.id);
    setEditingDesc(post.description);
    setTimeout(() => editDescRef.current?.focus(), 0);
  };

  const savePostEdit = () => {
    if (!editingPostId) return;
    const trimmed = editingDesc.trim();
    if (trimmed) {
      setPosts((prev) =>
        prev.map((p) => (p.id === editingPostId ? { ...p, description: trimmed } : p))
      );
    }
    setEditingPostId(null);
  };

  const cancelPostEdit = () => {
    setEditingPostId(null);
    setEditingDesc("");
  };

  return (
    <MobileLayout hideHeader>
      <div className="p-4">
        {/* Profile header */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar src={null} alt={petName} size="lg" />
            <button
              type="button"
              className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white shadow-sm"
              aria-label="프로필 사진 변경"
            >
              <Camera size={11} strokeWidth={2} />
            </button>
          </div>

          <div className="flex-1">
            {isEditingPetName ? (
              <div className="flex items-center gap-1.5">
                <input
                  ref={petNameRef}
                  value={petNameInput}
                  onChange={(e) => setPetNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") savePetName();
                    if (e.key === "Escape") cancelPetName();
                  }}
                  className="w-28 rounded border border-brand px-1.5 py-0.5 text-body-lg font-bold text-neutral-black-800 outline-none focus:ring-1 focus:ring-brand"
                  maxLength={12}
                />
                <button
                  type="button"
                  onClick={savePetName}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white"
                  aria-label="이름 저장"
                >
                  <Check size={12} strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  onClick={cancelPetName}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-gray-500"
                  aria-label="이름 편집 취소"
                >
                  <X size={12} strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={startEditingPetName}
                className="flex items-center gap-1 text-body-lg font-bold text-neutral-black-800 transition-colors active:text-brand"
              >
                {petName}
                <Pencil size={12} strokeWidth={1.5} className="text-gray-400" />
              </button>
            )}

            {isEditingNickname ? (
              <div className="mt-0.5 flex items-center gap-1.5">
                <input
                  ref={nicknameRef}
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveNickname();
                    if (e.key === "Escape") cancelNickname();
                  }}
                  className="w-24 rounded border border-brand px-1.5 py-0.5 text-caption text-gray-700 outline-none focus:ring-1 focus:ring-brand"
                  maxLength={12}
                />
                <button
                  type="button"
                  onClick={saveNickname}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white"
                  aria-label="닉네임 저장"
                >
                  <Check size={12} strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  onClick={cancelNickname}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-gray-500"
                  aria-label="닉네임 편집 취소"
                >
                  <X size={12} strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={startEditingNickname}
                className="mt-0.5 flex items-center gap-1 text-caption text-gray-500 transition-colors active:text-brand"
              >
                {nickname}
                <Pencil size={11} strokeWidth={1.5} />
              </button>
            )}

            {/* 동물 종류 */}
            {isEditingBreed ? (
              <div className="relative mt-1">
                <div className="flex items-center gap-1.5">
                  <input
                    ref={breedRef}
                    value={breedInput}
                    onChange={(e) => {
                      setBreedInput(e.target.value);
                      setShowBreedDropdown(true);
                      setIsCustomBreed(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveBreed();
                      if (e.key === "Escape") cancelBreed();
                    }}
                    placeholder="종류 검색 또는 직접 입력"
                    className="w-36 rounded border border-brand px-1.5 py-0.5 text-caption text-gray-700 outline-none focus:ring-1 focus:ring-brand"
                    maxLength={20}
                  />
                  <button type="button" onClick={saveBreed} className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white" aria-label="종류 저장">
                    <Check size={12} strokeWidth={2.5} />
                  </button>
                  <button type="button" onClick={cancelBreed} className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-gray-500" aria-label="종류 편집 취소">
                    <X size={12} strokeWidth={2.5} />
                  </button>
                </div>
                {showBreedDropdown && filteredBreeds.length > 0 && (
                  <div className="absolute left-0 top-full z-20 mt-1 max-h-40 w-52 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                    {filteredBreeds.map((b) => (
                      <button key={b} type="button" onClick={() => selectBreed(b)} className="block w-full px-3 py-2 text-left text-caption text-gray-700 hover:bg-gray-50 active:bg-gray-100">
                        {b}
                      </button>
                    ))}
                    {breedInput.trim() && !BREED_LIST.includes(breedInput.trim()) && (
                      <button type="button" onClick={() => { setIsCustomBreed(true); setShowBreedDropdown(false); }} className="block w-full border-t border-gray-100 px-3 py-2 text-left text-caption font-medium text-brand">
                        &quot;{breedInput.trim()}&quot; 직접 입력
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={startEditingBreed}
                className="mt-1 flex items-center gap-1 text-caption text-gray-400 transition-colors active:text-brand"
              >
                {petBreed || "동물 종류 등록"}
                {petBreed ? <Pencil size={10} strokeWidth={1.5} /> : <ChevronDown size={12} strokeWidth={1.5} />}
              </button>
            )}
          </div>

          <Link
            href="/my/settings"
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-body-sm text-gray-600 active:bg-gray-50"
          >
            계정
          </Link>
        </div>

        {/* Stats row */}
        <div className="mt-4 flex justify-around rounded-xl bg-gray-50 py-3">
          <div className="text-center">
            <p className="text-body-base font-bold text-neutral-black-800">{posts.length}</p>
            <p className="text-caption text-gray-500">게시물</p>
          </div>
          <div className="text-center">
            <p className="text-body-base font-bold text-neutral-black-800">128</p>
            <p className="text-caption text-gray-500">팔로워</p>
          </div>
          <div className="text-center">
            <p className="text-body-base font-bold text-neutral-black-800">56</p>
            <p className="text-caption text-gray-500">팔로잉</p>
          </div>
        </div>

        {/* Content tabs */}
        <div className="mt-6 flex border-b border-gray-200">
          {(["사진", "영상", "기록"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setContentTab(tab)}
              className={`flex-1 pb-2 text-center text-body-sm font-medium transition-colors ${
                contentTab === tab ? "border-b-2 border-brand text-brand" : "text-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Action bar */}
        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (isManaging) {
                setIsManaging(false);
                setSelectedIds(new Set());
              } else {
                setIsManaging(true);
              }
            }}
            className={`rounded-full px-3 py-1 text-caption font-medium transition-colors ${
              isManaging ? "bg-brand text-white" : "bg-gray-100 text-gray-600 active:bg-gray-200"
            }`}
          >
            {isManaging ? "완료" : "관리"}
          </button>

          {isManaging && selectedIds.size > 0 && (
            <button
              type="button"
              onClick={handleDeleteSelected}
              className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-caption font-medium text-red-500 active:bg-red-100"
            >
              <Trash2 size={13} strokeWidth={1.8} />
              삭제 ({selectedIds.size})
            </button>
          )}

          {!isManaging && (
            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"))}
              className="flex items-center gap-1 text-caption text-gray-500 active:text-brand"
            >
              {sortOrder === "newest" ? "최신순" : "오래된순"}
              <ArrowDownUp size={14} strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* Photo grid */}
        {contentTab === "사진" && (
          <div className="mt-3">
            {posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16">
                <Camera size={40} className="text-gray-300" strokeWidth={1.2} />
                <p className="text-body-sm text-gray-500">아직 업로드한 사진이 없어요.</p>
                <Link
                  href="/upload"
                  className="rounded-full bg-brand px-4 py-2 text-body-sm text-white active:bg-brand/90"
                >
                  첫 사진 올리기
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-0.5" role="list">
                {sortedPosts.map((post) => {
                  const isSelected = selectedIds.has(post.id);
                  const isEditing = editingPostId === post.id;

                  return (
                    <div key={post.id} className="group relative" role="listitem">
                      {/* Manage mode: select overlay */}
                      {isManaging && (
                        <button
                          type="button"
                          onClick={() => toggleSelect(post.id)}
                          className="absolute inset-0 z-10"
                          aria-label={isSelected ? "선택 해제" : "선택"}
                        >
                          <div
                            className={`absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                              isSelected
                                ? "border-brand bg-brand text-white"
                                : "border-white bg-black/20"
                            }`}
                          >
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                          {isSelected && (
                            <div className="absolute inset-0 rounded-lg bg-brand/10" />
                          )}
                        </button>
                      )}

                      <div
                        className={`relative aspect-square overflow-hidden rounded-lg bg-gray-100 ${
                          isSelected ? "ring-2 ring-brand" : ""
                        }`}
                      >
                        <Image
                          src={post.imageUrl}
                          alt={post.description}
                          fill
                          sizes="33vw"
                          className="object-cover"
                        />
                      </div>

                      {/* Non-manage mode: hover/long-press actions */}
                      {!isManaging && !isEditing && (
                        <div className="absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => startEditingPost(post)}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm"
                            aria-label="설명 수정"
                          >
                            <Pencil size={11} strokeWidth={2} />
                          </button>
                        </div>
                      )}

                      {/* Inline edit description */}
                      {isEditing && (
                        <div className="absolute inset-x-0 bottom-0 z-10 bg-black/60 p-1.5 backdrop-blur-sm">
                          <input
                            ref={editDescRef}
                            value={editingDesc}
                            onChange={(e) => setEditingDesc(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") savePostEdit();
                              if (e.key === "Escape") cancelPostEdit();
                            }}
                            className="w-full rounded bg-white/90 px-2 py-1 text-[11px] text-gray-800 outline-none"
                            maxLength={50}
                            placeholder="설명을 입력하세요"
                          />
                          <div className="mt-1 flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={savePostEdit}
                              className="rounded bg-brand px-2 py-0.5 text-[10px] font-medium text-white"
                            >
                              저장
                            </button>
                            <button
                              type="button"
                              onClick={cancelPostEdit}
                              className="rounded bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-600"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {contentTab !== "사진" && (
          <div className="flex flex-col items-center justify-center gap-2 py-16">
            <p className="text-body-sm text-gray-400">준비 중이에요.</p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
