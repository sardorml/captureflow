"use client";

import { Button, Card } from "@heroui/react";
import { Download, Play } from "lucide-react";
import { useState, useTransition } from "react";
import { renderAction } from "@/app/actions";
import type { Composition, LibraryItem } from "@/lib/library";
import { MediaPreview, mediaUrl } from "./media-preview";

export function CompositionCard({
  composition,
  latest,
}: {
  composition: Composition;
  latest: LibraryItem | null;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onRender = () => {
    setError(null);
    startTransition(async () => {
      const res = await renderAction(composition.kind, composition.slug);
      if (res.error) setError(res.error);
    });
  };

  return (
    <Card className="gap-4 border border-line bg-panel p-4">
      <MediaPreview kind={composition.kind} file={latest?.file ?? null} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-fg">{composition.slug}</p>
          <p className="truncate font-mono text-xs text-fg-muted">
            hyperframes/{composition.source}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {latest && (
            <a
              href={mediaUrl(latest.file, true)}
              aria-label="Download latest render"
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-fg-muted hover:bg-tint hover:text-fg"
            >
              <Download size={16} />
            </a>
          )}
          <Button
            size="sm"
            variant="primary"
            isDisabled={pending}
            onPress={onRender}
          >
            <Play size={14} />
            {pending ? "Rendering…" : "Render"}
          </Button>
        </div>
      </div>
      {error && (
        <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-canvas p-3 text-xs text-danger">
          {error}
        </pre>
      )}
    </Card>
  );
}
