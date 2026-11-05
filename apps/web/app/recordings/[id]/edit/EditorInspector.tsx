"use client";

import {
  Captions,
  Info,
  Palette,
  PanelRightClose,
  PanelRightOpen,
  type LucideIcon,
} from "lucide-react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { useState, type ReactNode } from "react";
import { useAppMessages } from "@/components/app-i18n-provider";
import { TabsContent } from "@/components/ui/tabs";
import type { RecordingConfig } from "@/lib/recording-config";
import { cn } from "@/lib/utils";
import {
  AudioControls,
  BackgroundPicker,
  CameraPicker,
  DetailsList,
  type RecordingDetails,
} from "./EditorControls";
import {
  EditorTranscriptPanel,
  type EditorTranscriptPanelProps,
} from "./EditorTranscriptPanel";

type Props = {
  config: RecordingConfig;
  onConfig: (patch: Partial<RecordingConfig>) => void;
  hasWebcam: boolean;
  aspect: number;
  details: RecordingDetails;
  transcript: EditorTranscriptPanelProps;
  stage: ReactNode;
  timeline: ReactNode;
};

const PANELS = [
  { value: "transcript", icon: Captions },
  { value: "design", icon: Palette },
  { value: "details", icon: Info },
] as const satisfies readonly {
  value: string;
  icon: LucideIcon;
}[];

const RAIL_ITEM_CLASS =
  "flex w-full flex-col items-center gap-1 rounded-lg px-1 py-2 text-center text-[11px] leading-tight font-medium wrap-anywhere hyphens-auto text-fg-muted transition-colors outline-none hover:bg-tint hover:text-fg focus-visible:ring-2 focus-visible:ring-accent-ring";
const PANEL_CLASS = "flex min-h-0 flex-1 flex-col p-0 outline-hidden";

/*
 * The editor's frame: the stage and the open panel side by side with the
 * timeline under both, and the rail that picks the panel running the full
 * height beside them. The rail has to share a Tabs root with the panels, so
 * this owns the layout and takes the stage and timeline as slots.
 */
export function EditorInspector({
  config,
  onConfig,
  hasWebcam,
  aspect,
  details,
  transcript,
  stage,
  timeline,
}: Props) {
  const [panel, setPanel] = useState<string>("transcript");
  const [open, setOpen] = useState(true);
  const m = useAppMessages();
  const t = m.recordingEditor;
  const shownPanel =
    PANELS.find((p) => p.value === panel)?.value ?? PANELS[0].value;

  return (
    <TabsPrimitive.Root
      value={panel}
      onValueChange={setPanel}
      orientation="vertical"
      activationMode="manual"
      className="flex min-h-0 flex-1"
    >
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1">
          <section className="min-h-0 min-w-0 flex-1 bg-canvas">
            {stage}
          </section>
          {open ? (
            <aside className="hidden w-[max(20rem,29vw)] shrink-0 flex-col border-l border-line bg-panel lg:flex">
              <TabsContent value="transcript" className={PANEL_CLASS}>
                <EditorTranscriptPanel {...transcript} />
              </TabsContent>

              <TabsContent value="design" className={PANEL_CLASS}>
                <div className="min-h-0 flex-1 overflow-y-auto">
                  <Section title={t.background.title}>
                    <BackgroundPicker
                      background={config.background}
                      onChange={(bg) => onConfig({ background: bg })}
                    />
                  </Section>
                  {hasWebcam ? (
                    <Section title={t.camera.title}>
                      <CameraPicker
                        corner={config.cameraCorner}
                        point={config.cameraPoint}
                        size={config.cameraSize}
                        hidden={config.cameraHidden}
                        aspect={aspect}
                        onCorner={(corner) =>
                          onConfig({ cameraCorner: corner, cameraPoint: null })
                        }
                        onPoint={(point) => onConfig({ cameraPoint: point })}
                        onSize={(size) => onConfig({ cameraSize: size })}
                        onHidden={(hidden) =>
                          onConfig({ cameraHidden: hidden })
                        }
                      />
                    </Section>
                  ) : null}
                  <Section title={t.audio.title}>
                    <AudioControls
                      micMuted={config.micMuted}
                      systemMuted={config.systemMuted}
                      hasMic={hasWebcam}
                      onMic={(muted) => onConfig({ micMuted: muted })}
                      onSystem={(muted) => onConfig({ systemMuted: muted })}
                    />
                  </Section>
                </div>
              </TabsContent>

              <TabsContent value="details" className={PANEL_CLASS}>
                <div className="min-h-0 flex-1 overflow-y-auto">
                  <Section title={t.details.title}>
                    <DetailsList {...details} />
                  </Section>
                </div>
              </TabsContent>
            </aside>
          ) : null}
        </div>
        {timeline}
      </div>

      <div className="hidden w-16 shrink-0 flex-col justify-between border-l border-line bg-panel p-1.5 lg:flex">
        <TabsPrimitive.List
          aria-label={t.panels.label}
          className="flex flex-col gap-1"
        >
          {PANELS.map(({ value, icon: Icon }) => (
            <TabsPrimitive.Trigger
              key={value}
              value={value}
              onClick={() => setOpen(true)}
              className={cn(
                RAIL_ITEM_CLASS,
                open &&
                  "data-[state=active]:bg-tint data-[state=active]:text-fg",
              )}
            >
              <Icon className="size-5" aria-hidden />
              {t.panels.tabs[value]}
            </TabsPrimitive.Trigger>
          ))}
        </TabsPrimitive.List>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={RAIL_ITEM_CLASS}
        >
          {open ? (
            <PanelRightClose className="size-5" aria-hidden />
          ) : (
            <PanelRightOpen className="size-5" aria-hidden />
          )}
          {open ? t.panels.hide[shownPanel] : t.panels.show[shownPanel]}
        </button>
      </div>
    </TabsPrimitive.Root>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-b border-line px-5 py-4 last:border-b-0">
      <h3 className="mb-3 text-[11px] font-semibold tracking-wider text-fg-muted uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}
