"use client";

import { useState } from "react";
import { ExternalLink, PenLine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PRODUCT_NAME } from "@/lib/site";
import { RecordButton } from "../RecordButton";

type Surface = "extension" | "desktop" | "canvas";

const TAB_CLASS =
  "h-9 flex-none justify-center rounded-lg border-none px-4 text-sm font-medium whitespace-nowrap text-fg-muted data-active:bg-panel-2 data-active:text-fg data-active:shadow-sm dark:data-active:bg-white/10";

const SURFACES: { id: Surface; label: string }[] = [
  { id: "extension", label: "Extension" },
  { id: "desktop", label: "Desktop app" },
  { id: "canvas", label: "Canvas" },
];

export function StartCard({ storeUrl }: { storeUrl: string | null }) {
  const [surface, setSurface] = useState<Surface>("extension");

  return (
    <section className="rounded-3xl bg-panel p-6 ring-1 ring-line md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <h2 className="text-2xl font-semibold tracking-tight text-accent-strong">
          Start recording with {PRODUCT_NAME}
        </h2>
        <Tabs
          value={surface}
          onValueChange={(value) => setSurface(value as Surface)}
          aria-label="Where to record"
        >
          <TabsList className="h-auto w-fit max-w-full justify-start gap-0 overflow-x-auto rounded-xl bg-tint p-1">
            {SURFACES.map((s) => (
              <TabsTrigger key={s.id} value={s.id} className={TAB_CLASS}>
                {s.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col gap-5 pt-5">
        {surface === "extension" && (
          <>
            <p className="text-base text-fg-muted">
              Record any tab, window or your whole screen from the toolbar, and
              get a link you can share with anyone.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <RecordButton label="Record now" />
              {storeUrl && (
                <a
                  href={storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: "secondary" })}
                >
                  Add to Chrome
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
          </>
        )}
        {surface === "desktop" && (
          <>
            <p className="text-base text-fg-muted">
              A native Mac app that records your screen and camera with system
              audio is on its way. Until then, the extension records any tab,
              window or your whole screen.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button disabled>Download for Mac</Button>
              <Badge>Coming soon</Badge>
            </div>
          </>
        )}
        {surface === "canvas" && (
          <>
            <p className="text-base text-fg-muted">
              A blank board with pens, shapes and text to draw on while you
              record, when there is no page to show.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/canvas"
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants()}
              >
                <PenLine size={16} />
                Open the canvas
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
