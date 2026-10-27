"use client";

import { useState } from "react";
import { ExternalLink, PenLine } from "lucide-react";
import { Button, Chip, Tabs, buttonVariants } from "@heroui/react";
import { PRODUCT_NAME } from "@/lib/site";
import { RecordButton } from "../RecordButton";

type Surface = "extension" | "desktop" | "canvas";

const TAB_CLASS =
  "isolate h-9 justify-center px-4 text-sm font-medium whitespace-nowrap text-fg-muted data-[selected=true]:text-fg";

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
        <h2 className="text-2xl font-semibold tracking-tight text-accent">
          Start recording with {PRODUCT_NAME}
        </h2>
        <Tabs
          selectedKey={surface}
          onSelectionChange={(key) => setSurface(key as Surface)}
          aria-label="Where to record"
        >
          <Tabs.ListContainer className="w-fit max-w-full overflow-x-auto rounded-xl bg-tint p-1">
            <Tabs.List className="flex gap-0 p-0">
              {SURFACES.map((s) => (
                <Tabs.Tab key={s.id} id={s.id} className={TAB_CLASS}>
                  <Tabs.Indicator className="rounded-lg bg-panel-2 shadow-sm dark:bg-white/10" />
                  {s.label}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs.ListContainer>
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
              <Button variant="primary" isDisabled>
                Download for Mac
              </Button>
              <Chip size="sm" color="accent">
                Coming soon
              </Chip>
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
                className={buttonVariants({ variant: "primary" })}
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
