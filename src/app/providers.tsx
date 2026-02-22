"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { LikesProvider } from "@/lib/likes-context";
import { UploadProvider } from "@/lib/upload-context";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 60 * 1000 } } }));
  return (
    <QueryClientProvider client={client}>
      <LikesProvider>
        <UploadProvider>{children}</UploadProvider>
      </LikesProvider>
    </QueryClientProvider>
  );
}
