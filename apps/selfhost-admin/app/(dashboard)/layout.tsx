import type { ReactNode } from "react";
import { AdminNav } from "@/app/_nav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-6 lg:flex-row lg:gap-10 lg:py-10">
      <AdminNav />
      <main className="flex min-w-0 flex-1 flex-col gap-8">{children}</main>
    </div>
  );
}
