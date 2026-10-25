"use client";

import { useRouter } from "next/navigation";
import { Camera, ExternalLink, Trash2, Video } from "lucide-react";
import { Button, Typography } from "@heroui/react";
import { useState, useTransition } from "react";
import type { StorageItem, StorageItemKind } from "@captureflow/quota";
import { deleteRecordingAction, deleteScreenshotAction } from "@/app/actions";
import {
  useConfirm,
  type ConfirmOptions,
} from "@/app/_components/confirm-dialog";
import { formatBytes, formatRelativeShort } from "@/lib/format";

const KIND: Record<
  StorageItemKind,
  {
    label: string;
    icon: typeof Video;
    href: (id: string) => string;
    remove: (id: string) => Promise<{ error: string | null }>;
    confirm: ConfirmOptions;
  }
> = {
  recording: {
    label: "Recording",
    icon: Video,
    href: (id) => `/r/${id}`,
    remove: deleteRecordingAction,
    confirm: {
      title: "Delete this recording?",
      description:
        "The video and its link stop working immediately. This cannot be undone.",
    },
  },
  screenshot: {
    label: "Screenshot",
    icon: Camera,
    href: (id) => `/s/${id}`,
    remove: deleteScreenshotAction,
    confirm: {
      title: "Delete this screenshot?",
      description:
        "The image and its link stop working immediately. This cannot be undone.",
    },
  },
};

export function StorageItems({ items }: { items: StorageItem[] }) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [removed, setRemoved] = useState<ReadonlySet<string>>(new Set());
  const visible = items.filter((item) => !removed.has(keyOf(item)));

  const confirmDelete = (item: StorageItem) =>
    confirm({
      ...KIND[item.kind].confirm,
      confirmLabel: "Delete",
      destructive: true,
    });

  const remove = async (item: StorageItem): Promise<string | null> => {
    const res = await KIND[item.kind].remove(item.id);
    if (res.error) return res.error;
    setRemoved((prev) => new Set(prev).add(keyOf(item)));
    router.refresh();
    return null;
  };

  if (visible.length === 0) {
    return (
      <>
        <Typography type="body-sm" color="muted">
          Nothing is taking up space yet.
        </Typography>
        {dialog}
      </>
    );
  }

  return (
    <>
      <ul className="-my-3 divide-y divide-line">
        {visible.map((item) => (
          <Row
            key={keyOf(item)}
            item={item}
            onConfirm={() => confirmDelete(item)}
            onDelete={() => remove(item)}
          />
        ))}
      </ul>
      {dialog}
    </>
  );
}

function keyOf(item: StorageItem): string {
  return `${item.kind}:${item.id}`;
}

function Row({
  item,
  onConfirm,
  onDelete,
}: {
  item: StorageItem;
  onConfirm: () => Promise<boolean>;
  onDelete: () => Promise<string | null>;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const kind = KIND[item.kind];
  const Icon = kind.icon;
  const title = item.title?.trim() || `Untitled ${kind.label.toLowerCase()}`;

  return (
    <li className="flex items-center gap-3 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-tint text-fg-muted">
        <Icon size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <a
          href={kind.href(item.id)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-sm font-medium text-fg hover:text-accent"
        >
          <span className="truncate">{title}</span>
          <ExternalLink size={12} className="shrink-0 text-fg-subtle" />
        </a>
        <p className="truncate text-xs text-fg-muted">
          {kind.label} · {item.workspaceName} ·{" "}
          {formatRelativeShort(item.createdAt)}
        </p>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
      <span className="shrink-0 text-sm tabular-nums text-fg">
        {formatBytes(item.bytes)}
      </span>
      <Button
        variant="ghost"
        size="sm"
        isIconOnly
        isPending={pending}
        aria-label={`Delete ${title}`}
        className="shrink-0 text-fg-muted hover:text-danger"
        onPress={async () => {
          if (!(await onConfirm())) return;
          setError(null);
          startTransition(async () => setError(await onDelete()));
        }}
      >
        <Trash2 size={16} />
      </Button>
    </li>
  );
}
