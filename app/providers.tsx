"use client";

import { HeroUIProvider } from "@heroui/react";
import { useRouter } from "next/navigation";

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <HeroUIProvider
      locale="ja-JP"
      navigate={(path) => {
        const href = typeof path === "string" ? path : String(path ?? "");
        if (href) {
          router.push(href);
        }
      }}
    >
      {children}
    </HeroUIProvider>
  );
}
