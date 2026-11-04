import type { ReactNode } from "react";

export default function SetupLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
      {children}
    </main>
  );
}
