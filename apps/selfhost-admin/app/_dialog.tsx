"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

// A native modal dialog: Escape, the close button and a click outside all close it.
export function Dialog({
  title,
  description,
  onClose,
  children,
}: {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="m-auto w-[min(36rem,calc(100vw-2rem))] rounded-2xl bg-panel p-0 text-foreground ring-1 ring-line backdrop:bg-black/60"
    >
      <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-fg-strong">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-fg-muted">{description}</p>
          )}
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="-mr-1.5 cursor-pointer rounded-lg p-1.5 text-fg-muted hover:bg-tint hover:text-fg"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </dialog>
  );
}
