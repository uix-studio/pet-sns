"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowDownUp, Check, Pencil, Trash2, X, Camera, ChevronDown, FolderPlus, Folder, ArrowLeft } from "lucide-react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Avatar } from "@/components/ui/Avatar";

const BREED_LIST = [
  "골든 리트리버", "포메라니안", "말티즈", "시바견", "비숑 프리제",
  "푸들", "치와와", "웰시코기", "프렌치 불독", "보더콜리",
  "페르시안", "러시안 블루", "브리티시 숏헤어", "스코티시 폴드", "랙돌",
  "꼬숑 (꼬똥드툴레아+비숑)", "말티푸 (말티즈+푸들)", "폼스키 (포메라니안+허스키)",
  "코카푸 (코커스패니얼+푸들)", "골든두들 (골든리트리버+푸들)",
];
const SORTED_BREEDS = [...BREED_LIST].sort((a, b) => a.localeCompare(b, "ko"));

interface MyPost {
  id: string;
  imageUrl: string;
  description: string;
  type?: "photo" | "video";
}

interface MyGroup {
  id: string;
  name: string;
  postIds: string[];
}

const INITIAL_POSTS: MyPost[] = [
  { id: "1", imageUrl: "/placeholder-3.png", description: "오늘 산책 나왔어요" },
  { id: "2", imageUrl: "/placeholder-4.png", description: "간식 먹는 중" },
  { id: "3", imageUrl: "/placeholder-1.png", description: "낮잠 자는 모습" },
  { id: "4", imageUrl: "/placeholder-2.png", description: "목욕 후 뽀송뽀송" },
  { id: "5", imageUrl: "/placeholder-3.png", description: "공원에서 놀기" },
  { id: "6", imageUrl: "/placeholder-4.png", description: "새 옷 입었어요" },
];

type ContentTab = "사진" | "영상" | "그룹";

export default function MyPage() {
  const [contentTab, setContentTab] = useState<ContentTab>("사진");
  const [posts, setPosts] = useState<MyPost[]>(INITIAL_POSTS);

  const [isManaging, setIsManaging] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [nickname, setNickname] = useState("송맘");
  const [petName, setPetName] = useState("송이");
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(nickname);
  const nicknameRef = useRef<HTMLInputElement>(null);

  const [petNameInput, setPetNameInput] = useState(petName);

  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const [petBreed, setPetBreed] = useState("");
  const [isEditingBreed, setIsEditingBreed] = useState(false);
  const [breedInput, setBreedInput] = useState("");
  const [breedSearchInput, setBreedSearchInput] = useState("");
  const [showBreedDropdown, setShowBreedDropdown] = useState(false);
  const [isCustomBreed, setIsCustomBreed] = useState(false);
  const breedRef = useRef<HTMLInputElement>(null);

  const filteredBreeds = breedSearchInput.trim()
    ? SORTED_BREEDS.filter((b) => b.includes(breedSearchInput.trim()))
    : SORTED_BREEDS;

  const startEditingBreed = () => {
    setBreedInput(petBreed);
    setBreedSearchInput("");
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
    setBreedSearchInput("");
    setIsEditingBreed(false);
    setShowBreedDropdown(false);
    setIsCustomBreed(false);
  };

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingDesc, setEditingDesc] = useState("");
  const editDescRef = useRef<HTMLInputElement>(null);

  // Group state
  const [groups, setGroups] = useState<MyGroup[]>([]);
  const [groupSelectMode, setGroupSelectMode] = useState(false);
  const [groupSelectedIds, setGroupSelectedIds] = useState<Set<string>>(new Set());
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState("");
  const [viewingGroupId, setViewingGroupId] = useState<string | null>(null);
  const [groupEditMode, setGroupEditMode] = useState(false);
  const [groupEditSelectedIds, setGroupEditSelectedIds] = useState<Set<string>>(new Set());
  const groupNameRef = useRef<HTMLInputElement>(null);

  const toggleGroupSelect = useCallback((id: string) => {
    setGroupSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const createGroup = () => {
    if (groupSelectedIds.size === 0) return;
    const newGroup: MyGroup = {
      id: `group-${Date.now()}`,
      name: `그룹 ${groups.length + 1}`,
      postIds: Array.from(groupSelectedIds),
    };
    setGroups((prev) => [...prev, newGroup]);
    setGroupSelectedIds(new Set());
    setGroupSelectMode(false);
  };

  const startEditingGroup = (group: MyGroup) => {
    setEditingGroupId(group.id);
    setEditingGroupName(group.name);
    setTimeout(() => groupNameRef.current?.focus(), 0);
  };

  const saveGroupName = () => {
    if (!editingGroupId) return;
    const trimmed = editingGroupName.trim();
    if (trimmed) {
      setGroups((prev) => prev.map((g) => (g.id === editingGroupId ? { ...g, name: trimmed } : g)));
    }
    setEditingGroupId(null);
  };

  const deleteGroup = (groupId: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    if (viewingGroupId === groupId) setViewingGroupId(null);
  };

  const removeFromGroup = (groupId: string, postIds: Set<string>) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, postIds: g.postIds.filter((pid) => !postIds.has(pid)) } : g
      )
    );
    setGroupEditSelectedIds(new Set());
    setGroupEditMode(false);
  };

  const viewingGroup = groups.find((g) => g.id === viewingGroupId);
  const viewingGroupPosts = viewingGroup
    ? posts.filter((p) => viewingGroup.postIds.includes(p.id))
    : [];

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

  const startEditingProfile = () => {
    setNicknameInput(nickname);
    setPetNameInput(petName);
    setIsProfileEditing(true);
    setTimeout(() => nicknameRef.current?.focus(), 0);
  };

  const saveProfile = () => {
    const nextNickname = nicknameInput.trim();
    const nextPetName = petNameInput.trim();
    if (nextNickname) setNickname(nextNickname);
    if (nextPetName) setPetName(nextPetName);
    setIsProfileEditing(false);
  };

  const cancelProfile = () => {
    setNicknameInput(nickname);
    setPetNameInput(petName);
    setIsProfileEditing(false);
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
            {isProfileEditing ? (
              <div className="flex items-center gap-1.5">
                <input
                  value={petNameInput}
                  onChange={(e) => setPetNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveProfile();
                    if (e.key === "Escape") cancelProfile();
                  }}
                  className="w-28 rounded border border-brand px-1.5 py-0.5 text-body-lg font-bold text-neutral-black-800 outline-none focus:ring-1 focus:ring-brand"
                  maxLength={12}
                />
              </div>
            ) : (
              <div className="flex items-center gap-1 text-body-lg font-bold text-neutral-black-800">
                {petName}
              </div>
            )}

            {isProfileEditing ? (
              <div className="mt-0.5 flex items-center gap-1.5">
                <input
                  ref={nicknameRef}
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveProfile();
                    if (e.key === "Escape") cancelProfile();
                  }}
                  className="w-24 rounded border border-brand px-1.5 py-0.5 text-caption text-gray-700 outline-none focus:ring-1 focus:ring-brand"
                  maxLength={12}
                />
              </div>
            ) : (
              <div className="mt-0.5 flex items-center gap-1 text-caption text-gray-500">
                {nickname}
              </div>
            )}

            {/* 견종 */}
            {isEditingBreed ? (
              <div className="relative mt-1">
                <div className="flex items-center gap-1.5">
                  {isCustomBreed ? (
                    <input
                      ref={breedRef}
                      value={breedInput}
                      onChange={(e) => setBreedInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveBreed();
                        if (e.key === "Escape") cancelBreed();
                      }}
                      placeholder="견종 직접 입력"
                      className="w-36 rounded border border-brand px-1.5 py-0.5 text-caption text-gray-700 outline-none focus:ring-1 focus:ring-brand"
                      maxLength={20}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowBreedDropdown((prev) => !prev)}
                      className="flex w-36 items-center justify-between rounded border border-brand px-2 py-0.5 text-caption text-gray-700"
                    >
                      <span className="truncate">{breedInput || "견종 선택"}</span>
                      <ChevronDown size={12} strokeWidth={1.5} />
                    </button>
                  )}
                  <button type="button" onClick={saveBreed} className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white" aria-label="종류 저장">
                    <Check size={12} strokeWidth={2.5} />
                  </button>
                  <button type="button" onClick={cancelBreed} className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-gray-500" aria-label="종류 편집 취소">
                    <X size={12} strokeWidth={2.5} />
                  </button>
                </div>
                {showBreedDropdown && (
                  <div className="absolute left-0 top-full z-20 mt-1 max-h-40 w-52 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                    <div className="border-b border-gray-100 p-2">
                      <input
                        value={breedSearchInput}
                        onChange={(e) => setBreedSearchInput(e.target.value)}
                        placeholder="견종 검색"
                        className="w-full rounded border border-gray-200 px-2 py-1 text-caption text-gray-700 outline-none focus:border-brand"
                      />
                    </div>
                    {filteredBreeds.length > 0 ? (
                      filteredBreeds.map((b) => (
                        <button key={b} type="button" onClick={() => selectBreed(b)} className="block w-full px-3 py-2 text-left text-caption text-gray-700 hover:bg-gray-50 active:bg-gray-100">
                          {b}
                        </button>
                      ))
                    ) : (
                      <button type="button" onClick={() => { setIsCustomBreed(true); setShowBreedDropdown(false); }} className="block w-full border-t border-gray-100 px-3 py-2 text-left text-caption font-medium text-brand">
                        직접입력
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <button type="button" onClick={startEditingBreed} className="mt-1 flex items-center gap-1 text-caption text-gray-400 transition-colors active:text-brand">
                {petBreed || "견종 등록"}
                {petBreed ? <Pencil size={10} strokeWidth={1.5} /> : <ChevronDown size={12} strokeWidth={1.5} />}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isProfileEditing ? (
              <>
                <button type="button" onClick={saveProfile} className="rounded-lg bg-brand px-3 py-1.5 text-body-sm text-white active:bg-brand/90">
                  저장
                </button>
                <button type="button" onClick={cancelProfile} className="rounded-lg border border-gray-200 px-3 py-1.5 text-body-sm text-gray-600 active:bg-gray-50">
                  취소
                </button>
              </>
            ) : (
              <button type="button" onClick={startEditingProfile} className="rounded-lg border border-gray-200 px-3 py-1.5 text-body-sm text-gray-600 active:bg-gray-50">
                수정
              </button>
            )}
            <Link href="/my/settings" className="rounded-lg border border-gray-200 px-3 py-1.5 text-body-sm text-gray-600 active:bg-gray-50">
              계정
            </Link>
          </div>
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
          {(["사진", "영상", "그룹"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setContentTab(tab);
                setViewingGroupId(null);
                setGroupSelectMode(false);
                setGroupSelectedIds(new Set());
              }}
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

        {contentTab === "영상" && (
          <div className="flex flex-col items-center justify-center gap-2 py-16">
            <p className="text-body-sm text-gray-400">준비 중이에요.</p>
          </div>
        )}

        {/* 그룹 탭 */}
        {contentTab === "그룹" && (
          <div className="mt-3">
            {viewingGroupId && viewingGroup ? (
              /* 그룹 상세 보기 */
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => { setViewingGroupId(null); setGroupEditMode(false); setGroupEditSelectedIds(new Set()); }}
                    className="flex items-center gap-1 text-body-sm text-gray-600 active:text-brand"
                  >
                    <ArrowLeft size={16} strokeWidth={1.8} />
                    전체 그룹
                  </button>
                  <div className="flex items-center gap-2">
                    {groupEditMode ? (
                      <>
                        {groupEditSelectedIds.size > 0 && (
                          <button
                            type="button"
                            onClick={() => removeFromGroup(viewingGroup.id, groupEditSelectedIds)}
                            className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-caption font-medium text-red-500 active:bg-red-100"
                          >
                            <Trash2 size={13} strokeWidth={1.8} />
                            제거 ({groupEditSelectedIds.size})
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => { setGroupEditMode(false); setGroupEditSelectedIds(new Set()); }}
                          className="rounded-full bg-brand px-3 py-1 text-caption font-medium text-white"
                        >
                          완료
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setGroupEditMode(true)}
                        className="rounded-full bg-gray-100 px-3 py-1 text-caption font-medium text-gray-600 active:bg-gray-200"
                      >
                        편집
                      </button>
                    )}
                  </div>
                </div>

                {/* 그룹명 */}
                <div className="mb-3 flex items-center gap-2">
                  {editingGroupId === viewingGroup.id ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        ref={groupNameRef}
                        value={editingGroupName}
                        onChange={(e) => setEditingGroupName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveGroupName();
                          if (e.key === "Escape") setEditingGroupId(null);
                        }}
                        className="w-40 rounded border border-brand px-2 py-1 text-body-sm font-bold text-neutral-black-800 outline-none focus:ring-1 focus:ring-brand"
                        maxLength={20}
                      />
                      <button type="button" onClick={saveGroupName} className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white">
                        <Check size={13} strokeWidth={2.5} />
                      </button>
                      <button type="button" onClick={() => setEditingGroupId(null)} className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                        <X size={13} strokeWidth={2.5} />
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => startEditingGroup(viewingGroup)} className="flex items-center gap-1 text-body-base font-bold text-neutral-black-800 active:text-brand">
                      {viewingGroup.name}
                      <Pencil size={13} strokeWidth={1.5} className="text-gray-400" />
                    </button>
                  )}
                  <span className="text-caption text-gray-400">{viewingGroupPosts.length}개</span>
                </div>

                {viewingGroupPosts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-12">
                    <p className="text-body-sm text-gray-400">이 그룹에 항목이 없어요.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-0.5">
                    {viewingGroupPosts.map((post) => {
                      const isSelected = groupEditSelectedIds.has(post.id);
                      return (
                        <div key={post.id} className="relative">
                          {groupEditMode && (
                            <button
                              type="button"
                              onClick={() => {
                                setGroupEditSelectedIds((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(post.id)) next.delete(post.id);
                                  else next.add(post.id);
                                  return next;
                                });
                              }}
                              className="absolute inset-0 z-10"
                              aria-label={isSelected ? "선택 해제" : "선택"}
                            >
                              <div className={`absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${isSelected ? "border-brand bg-brand text-white" : "border-white bg-black/20"}`}>
                                {isSelected && <Check size={12} strokeWidth={3} />}
                              </div>
                              {isSelected && <div className="absolute inset-0 rounded-lg bg-brand/10" />}
                            </button>
                          )}
                          <div className={`relative aspect-square overflow-hidden rounded-lg bg-gray-100 ${isSelected ? "ring-2 ring-brand" : ""}`}>
                            <Image src={post.imageUrl} alt={post.description} fill sizes="33vw" className="object-cover" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : groupSelectMode ? (
              /* 그룹에 추가할 사진 선택 모드 */
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-body-sm font-medium text-neutral-black-800">그룹에 추가할 항목 선택</p>
                  <div className="flex items-center gap-2">
                    {groupSelectedIds.size > 0 && (
                      <button
                        type="button"
                        onClick={createGroup}
                        className="flex items-center gap-1 rounded-full bg-brand px-3 py-1 text-caption font-medium text-white active:bg-brand/90"
                      >
                        <FolderPlus size={13} strokeWidth={1.8} />
                        그룹 만들기 ({groupSelectedIds.size})
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => { setGroupSelectMode(false); setGroupSelectedIds(new Set()); }}
                      className="rounded-full bg-gray-100 px-3 py-1 text-caption font-medium text-gray-600"
                    >
                      취소
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-0.5">
                  {posts.map((post) => {
                    const isSelected = groupSelectedIds.has(post.id);
                    return (
                      <div key={post.id} className="relative">
                        <button
                          type="button"
                          onClick={() => toggleGroupSelect(post.id)}
                          className="absolute inset-0 z-10"
                          aria-label={isSelected ? "선택 해제" : "선택"}
                        >
                          <div className={`absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${isSelected ? "border-brand bg-brand text-white" : "border-white bg-black/20"}`}>
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                          {isSelected && <div className="absolute inset-0 rounded-lg bg-brand/10" />}
                        </button>
                        <div className={`relative aspect-square overflow-hidden rounded-lg bg-gray-100 ${isSelected ? "ring-2 ring-brand" : ""}`}>
                          <Image src={post.imageUrl} alt={post.description} fill sizes="33vw" className="object-cover" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* 그룹 목록 */
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-caption text-gray-500">{groups.length}개 그룹</span>
                  <button
                    type="button"
                    onClick={() => setGroupSelectMode(true)}
                    className="flex items-center gap-1 rounded-full bg-brand px-3 py-1 text-caption font-medium text-white active:bg-brand/90"
                  >
                    <FolderPlus size={13} strokeWidth={1.8} />
                    새 그룹
                  </button>
                </div>

                {groups.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16">
                    <Folder size={40} className="text-gray-300" strokeWidth={1.2} />
                    <p className="text-body-sm text-gray-500">아직 만든 그룹이 없어요.</p>
                    <p className="text-caption text-gray-400">사진이나 영상을 선택해서 그룹을 만들어 보세요.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {groups.map((group) => {
                      const groupPosts = posts.filter((p) => group.postIds.includes(p.id));
                      const coverUrl = groupPosts[0]?.imageUrl ?? "";
                      const isEditing = editingGroupId === group.id;

                      return (
                        <div key={group.id} className="overflow-hidden rounded-xl border border-gray-100 bg-white">
                          <button
                            type="button"
                            onClick={() => !isEditing && setViewingGroupId(group.id)}
                            className="flex w-full items-center gap-3 p-3 text-left active:bg-gray-50"
                          >
                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                              {coverUrl ? (
                                <Image src={coverUrl} alt="" fill sizes="64px" className="object-cover" />
                              ) : (
                                <div className="flex h-full items-center justify-center">
                                  <Folder size={24} className="text-gray-300" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              {isEditing ? (
                                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    ref={groupNameRef}
                                    value={editingGroupName}
                                    onChange={(e) => setEditingGroupName(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") saveGroupName();
                                      if (e.key === "Escape") setEditingGroupId(null);
                                    }}
                                    className="w-full rounded border border-brand px-2 py-0.5 text-body-sm font-bold text-neutral-black-800 outline-none focus:ring-1 focus:ring-brand"
                                    maxLength={20}
                                  />
                                  <button type="button" onClick={(e) => { e.stopPropagation(); saveGroupName(); }} className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                                    <Check size={11} strokeWidth={2.5} />
                                  </button>
                                  <button type="button" onClick={(e) => { e.stopPropagation(); setEditingGroupId(null); }} className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                                    <X size={11} strokeWidth={2.5} />
                                  </button>
                                </div>
                              ) : (
                                <p className="truncate text-body-sm font-bold text-neutral-black-800">{group.name}</p>
                              )}
                              <p className="mt-0.5 text-caption text-gray-400">{groupPosts.length}개 항목</p>
                            </div>
                          </button>
                          {!isEditing && (
                            <div className="flex border-t border-gray-100">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); startEditingGroup(group); }}
                                className="flex flex-1 items-center justify-center gap-1 py-2 text-caption text-gray-500 active:bg-gray-50"
                              >
                                <Pencil size={12} strokeWidth={1.5} />
                                이름 수정
                              </button>
                              <div className="w-px bg-gray-100" />
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); deleteGroup(group.id); }}
                                className="flex flex-1 items-center justify-center gap-1 py-2 text-caption text-red-400 active:bg-red-50"
                              >
                                <Trash2 size={12} strokeWidth={1.5} />
                                삭제
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
