import type { ReactNode } from "react";

export default function SetupLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-6">
          <span className="font-semibold text-fg-strong">CaptureFlow</span>
        </div>
      </header>
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
        {children}
      </main>
    </>
  );
}
