"use client";

import { Button } from "@heroui/react";
import { ExternalLink } from "lucide-react";
import { useState, useTransition } from "react";
import { startStudioAction } from "@/app/actions";

export function StudioPanel() {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onOpen = () => {
    setError(null);
    startTransition(async () => {
      const res = await startStudioAction();
      if (res.error) setError(res.error);
      else setUrl(res.url);
    });
  };

  if (!url) {
    return (
      <section className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-panel p-5">
        <div>
          <p className="font-medium text-fg">HyperFrames Studio</p>
          <p className="text-sm text-fg-muted">
            Edit the promo&apos;s timeline and scenes live. Changes save to
            hyperframes/.
          </p>
        </div>
        <Button variant="primary" isDisabled={pending} onPress={onOpen}>
          {pending ? "Starting…" : "Open Studio"}
        </Button>
        {error && (
          <pre className="whitespace-pre-wrap text-xs text-danger">{error}</pre>
        )}
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="font-medium text-fg">HyperFrames Studio</p>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg"
        >
          Open in new tab <ExternalLink size={14} />
        </a>
      </div>
      <iframe
        src={url}
        title="HyperFrames Studio"
        className="h-[78vh] w-full rounded-2xl border border-line bg-canvas"
      />
    </section>
  );
}
