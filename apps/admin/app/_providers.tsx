"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { RouterProvider } from "@heroui/react";

// Lets every HeroUI link (tabs, menu items, list items) navigate client-side.
export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();
  return <RouterProvider navigate={router.push}>{children}</RouterProvider>;
}
