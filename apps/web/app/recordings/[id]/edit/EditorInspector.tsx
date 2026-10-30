"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ReactNode } from "react";
import type { RecordingConfig } from "@/lib/recording-config";
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
};

const TAB_CLASS =
  "isolate h-8 flex-1 justify-center rounded-lg px-3 text-sm font-medium text-fg-muted data-active:bg-panel data-active:text-fg data-active:shadow-sm dark:data-active:border-transparent dark:data-active:bg-white/10";
const PANEL_CLASS = "flex min-h-0 flex-1 flex-col p-0 outline-hidden";

// The right-hand panel: the transcript, the look of the recording, and its
// facts, one tab each.
export function EditorInspector({
  config,
  onConfig,
  hasWebcam,
  aspect,
  details,
  transcript,
}: Props) {
  return (
    <aside className="hidden w-[360px] shrink-0 flex-col border-l border-line bg-panel lg:flex">
      <Tabs
        defaultValue="transcript"
        className="flex min-h-0 flex-1 flex-col gap-0"
      >
        <TabsList
          aria-label="Editor panels"
          className="m-3 flex h-auto w-auto shrink-0 gap-0 rounded-xl bg-tint p-1"
        >
          <TabsTrigger value="transcript" className={TAB_CLASS}>
            Transcript
          </TabsTrigger>
          <TabsTrigger value="design" className={TAB_CLASS}>
            Design
          </TabsTrigger>
          <TabsTrigger value="details" className={TAB_CLASS}>
            Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transcript" className={PANEL_CLASS}>
          <EditorTranscriptPanel {...transcript} />
        </TabsContent>

        <TabsContent value="design" className={PANEL_CLASS}>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <Section title="Background">
              <BackgroundPicker
                background={config.background}
                onChange={(bg) => onConfig({ background: bg })}
              />
            </Section>
            {hasWebcam ? (
              <Section title="Camera">
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
                  onHidden={(hidden) => onConfig({ cameraHidden: hidden })}
                />
              </Section>
            ) : null}
            <Section title="Audio">
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
            <Section title="Recording">
              <DetailsList {...details} />
            </Section>
          </div>
        </TabsContent>
      </Tabs>
    </aside>
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
