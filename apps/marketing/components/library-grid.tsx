"use client";

import { Button, Card } from "@heroui/react";
import { Download, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { deleteAction } from "@/app/actions";
import type { LibraryItem } from "@/lib/library";
import { KIND_LABEL, MEDIA_KINDS, type MediaKind } from "@/lib/media";
import { cn } from "@captureflow/ui/cn";
import { MediaPreview, mediaUrl } from "./media-preview";

const DATE = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatSize(bytes: number): string {
  return bytes >= 1_000_000
    ? `${(bytes / 1_000_000).toFixed(1)} MB`
    : `${Math.round(bytes / 1000)} KB`;
}

export function LibraryGrid({ items }: { items: LibraryItem[] }) {
  const [filter, setFilter] = useState<MediaKind | "all">("all");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const shown =
    filter === "all" ? items : items.filter((i) => i.kind === filter);

  const onDelete = (file: string) => {
    if (!window.confirm(`Delete ${file}?`)) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteAction(file);
      if (res.error) setError(res.error);
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-2">
        {(["all", ...MEDIA_KINDS] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setFilter(k)}
            className={cn(
              "rounded-full border border-line px-3 py-1 text-sm text-fg-muted hover:text-fg",
              filter === k && "bg-tint-strong text-fg",
            )}
          >
            {k === "all" ? "All" : `${KIND_LABEL[k]}s`} ·{" "}
            {k === "all"
              ? items.length
              : items.filter((i) => i.kind === k).length}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      {shown.length === 0 ? (
        <p className="text-sm text-fg-muted">Nothing rendered yet.</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {shown.map((item) => (
            <Card
              key={item.file}
              className="gap-3 border border-line bg-panel p-3"
            >
              <MediaPreview kind={item.kind} file={item.file} />
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-fg">
                    {item.slug}
                  </p>
                  <p className="text-xs text-fg-muted">
                    {KIND_LABEL[item.kind]} · {formatSize(item.size)} ·{" "}
                    {DATE.format(item.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <a
                    href={mediaUrl(item.file, true)}
                    aria-label={`Download ${item.file}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-fg-muted hover:bg-tint hover:text-fg"
                  >
                    <Download size={16} />
                  </a>
                  <Button
                    size="sm"
                    variant="ghost"
                    isIconOnly
                    aria-label={`Delete ${item.file}`}
                    isDisabled={pending}
                    onPress={() => onDelete(item.file)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
