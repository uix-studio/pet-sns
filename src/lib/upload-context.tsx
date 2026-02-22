"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface UploadImage {
  id: string;
  url: string;
  file: File | null;
}

interface UploadContextValue {
  images: UploadImage[];
  addFiles: (files: FileList | null) => void;
  removeImage: (id: string) => void;
  reorder: (fromIdx: number, toIdx: number) => void;
  clear: () => void;
}

const UploadContext = createContext<UploadContextValue | null>(null);

export function UploadProvider({ children }: { children: ReactNode }) {
  const [images, setImages] = useState<UploadImage[]>([]);

  const addFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newImages: UploadImage[] = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      url: URL.createObjectURL(file),
      file,
    }));
    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img?.url.startsWith("blob:")) URL.revokeObjectURL(img.url);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const reorder = useCallback((fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return;
    setImages((prev) => {
      const arr = [...prev];
      const [removed] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, removed);
      return arr;
    });
  }, []);

  const clear = useCallback(() => {
    setImages((prev) => {
      prev.forEach((img) => {
        if (img.url.startsWith("blob:")) URL.revokeObjectURL(img.url);
      });
      return [];
    });
  }, []);

  return (
    <UploadContext.Provider value={{ images, addFiles, removeImage, reorder, clear }}>
      {children}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  const ctx = useContext(UploadContext);
  if (!ctx) throw new Error("useUpload must be used within UploadProvider");
  return ctx;
}
