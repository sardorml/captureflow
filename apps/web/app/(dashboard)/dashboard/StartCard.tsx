"use client";

import { useState } from "react";
import { ExternalLink, PenLine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppMessages } from "@/components/app-i18n-provider";
import { fmt } from "@/lib/i18n/format";
import { PRODUCT_NAME } from "@/lib/site";
import { RecordButton } from "../RecordButton";

type Surface = "extension" | "desktop" | "canvas";

const TAB_CLASS =
  "h-9 flex-none justify-center rounded-lg border-none px-4 text-sm font-medium whitespace-nowrap text-fg-muted data-active:bg-panel-2 data-active:text-fg data-active:shadow-sm dark:data-active:bg-white/10";

const SURFACES: Surface[] = ["extension", "desktop", "canvas"];

export function StartCard({ storeUrl }: { storeUrl: string | null }) {
  const [surface, setSurface] = useState<Surface>("extension");
  const m = useAppMessages();
  const copy = m.library.dashboard.start;

  return (
    <section className="rounded-3xl bg-panel p-6 ring-1 ring-line md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <h2 className="text-2xl font-semibold tracking-tight text-accent-strong">
          {fmt(copy.title, { product: PRODUCT_NAME })}
        </h2>
        <Tabs
          value={surface}
          onValueChange={(value) => setSurface(value as Surface)}
          aria-label={copy.surfacesLabel}
          className="max-w-full min-w-0"
        >
          <TabsList className="h-auto w-fit max-w-full justify-start gap-0 overflow-x-auto rounded-xl bg-tint p-1">
            {SURFACES.map((id) => (
              <TabsTrigger key={id} value={id} className={TAB_CLASS}>
                {copy.surfaces[id]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col gap-5 pt-5">
        {surface === "extension" && (
          <>
            <p className="text-base text-fg-muted">
              {copy.extension.description}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <RecordButton label={copy.extension.record} />
              {storeUrl && (
                <a
                  href={storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: "secondary" })}
                >
                  {copy.extension.addToChrome}
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
          </>
        )}
        {surface === "desktop" && (
          <>
            <p className="text-base text-fg-muted">
              {copy.desktop.description}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button disabled>{copy.desktop.download}</Button>
              <Badge>{copy.desktop.comingSoon}</Badge>
            </div>
          </>
        )}
        {surface === "canvas" && (
          <>
            <p className="text-base text-fg-muted">{copy.canvas.description}</p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/canvas"
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants()}
              >
                <PenLine size={16} />
                {m.library.dashboard.openCanvas}
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
